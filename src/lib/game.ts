'use client';

import { 
	Letter, 
	lettersToString,
	stringToLetters,
	ScrabbleDistribution
} from './letter';

import { Opponent, Opponents, FillWordbank } from './opponent';

import prand from 'pure-rand'

import {
	Battle,
	NextWord,

	NewBattle,
	Submit,
	Place,
	Backspace,
	Wipe
} from './battle';

import { BonusCard, BonusCards} from './bonus';
import { AbilityCard, AbilityCards } from './ability';
import { ScoreWord } from './score'

import { KnowledgeBase, Shuffle, ShuffleMap, MapConcat } from './util'

import {
	Preamble,
	PreambleSetup,
	NewPreamble
} from './preamble'

// Initially thought TS had ADTs & pattern matching on them
// But appears to be closer to C-style union types
// Still a nice modeling exercise
export type Phase 
	= Preamble
	| Battle 
	| Outcome

type BattleFn = (x: Battle) => void
type OutcomeFn = (x: Outcome) => void
type PreambleFn = (x: Preamble) => void
export type PhaseFn 
	= PreambleFn 
	| BattleFn
	| OutcomeFn

export interface Outcome {
	type: 'outcome'
	done: boolean
	victory: boolean

	opponent: Opponent
	letterUpgrades: number
}

export interface GameState {
	prng: prand.RandomGenerator

	phase: Phase;

	prestige: number
	level: number
	handSize: number;
	letters: Letter[]; 

	candidates: string[]

	banked: Map<string, boolean>
	wordbank: Map<string, Letter[]>

	abilities: Map<string, AbilityCard>
	bonuses: Map<string, BonusCard>
}

function Upgrade(g: GameState, n: number): void {
	if (n > 0) {
		let indices: number[] = []
		for (let i = 0; i < g.letters.length; i++) {
			indices[i] = i
		}

		Shuffle(g, indices).slice(0, n).forEach((idx) => {
			g.letters[idx].score += 2
			g.letters[idx].level += 1
		})
	}

	g.handSize += 2

	if (g.level >= 5) {
		g.prestige += 1
		g.level = 1
	} else {
		g.level += 1
	}
}

export function EndOutcome(o: Outcome): void {
	o.done = true
}

export function OutcomeToPreamble(g: GameState): void {
	if (g.phase.type !== 'outcome') {
		return
	}
	if (g.phase.victory) {
		Upgrade(g, g.phase.letterUpgrades)
	}
	g.phase = NewPreamble(g);
}

export async function LaunchBattle(g: GameState, kb: KnowledgeBase): Promise<void> {
	if (g.phase.type !== 'preamble') {
		return
	}

	for (const k of [g.phase.ability.choice]) {
		if (g.abilities.has(k)) {
			(g.abilities.get(k) as AbilityCard).uses += 1
		} else {
			g.abilities.set(k, AbilityCards.get(k) as AbilityCard)
		}
	}

	for (const k of [g.phase.bonus.choice]) {
		if (g.bonuses.has(k)) {
			(g.bonuses.get(k) as BonusCard).level += 1
		} else {
			g.bonuses.set(k, BonusCards.get(k) as BonusCard)
		}
	}

	const opponent = Opponents.get(g.phase.opponent.choice)
	if (opponent === undefined) {
		console.log(`Could not find opponent: ${g.phase.opponent.choice}`)
		return
	}

	opponent.level = (g.prestige * 3) + opponent.level
	await FillWordbank(kb.hypos, opponent)
	opponent.wordbank = ShuffleMap(g, opponent.wordbank)

	g.phase = NewBattle({
		handSize: g.handSize, 
		bonuses: g.bonuses,
		abilities: g.abilities,
		opponent: opponent,
		letters: Shuffle(g, g.letters),
		wordbank: g.wordbank
	});

	await ApplyScore(g.phase, kb)
}

export function NewGame(seed: number): GameState {
	const base: PreambleSetup = {
		prng: prand.xoroshiro128plus(seed),
		level: 1,
		prestige: 0,
		candidates: ['time', 'wood', 'boat', 'view', 'tube']
	}

	const preamble = NewPreamble(base)

	return {
		...base,
		handSize: 9,
		abilities: new Map<string, AbilityCard>(),
		bonuses: new Map<string, BonusCard>(),
		phase: preamble,
		letters: ScrabbleDistribution(),
		banked: new Map<string, boolean>,
		wordbank: new Map<string, Letter[]>,
	}
}

async function ApplyScore(b: Battle, kb: KnowledgeBase): Promise<void> {
	if (b.player.checkScore) {
		b.player.scoresheet = await ScoreWord(kb, b.player, b.opponent)
		b.player.checkScore = false
	} 

	if (b.opponent.checkScore) {
		b.opponent.scoresheet = await ScoreWord(kb, b.opponent, b.player)
		b.opponent.checkScore = false
	}
}

function DoPhase(g: GameState, phasefn: PhaseFn): GameState {
	const ng = Object.assign({}, g)

	if (ng.phase.type === 'battle') {
		(<BattleFn>phasefn)(ng.phase)
	} else if (ng.phase.type === 'preamble') {
		(<PreambleFn>phasefn)(ng.phase)
	} else if (ng.phase.type === 'outcome') {
		(<OutcomeFn>phasefn)(ng.phase)
	}

	return ng
}

async function FillPlayerBank(
	g: GameState, 
	lookup: (s: string) => Promise<string[]>, 
	s: string
): Promise<void> {
	let xs = []
	for (const word of await lookup(s)) {
		const up = word.toUpperCase()
		if (!g.wordbank.has(up)) {
			g.wordbank.set(up, stringToLetters(up, up))
		}
	}
}

export async function Mutate(
	g: GameState, 
	kb: KnowledgeBase,
	phasefn: PhaseFn,
	setfn: (g: GameState) => void
) {
	const gg = DoPhase(g, phasefn)
	setfn(gg)

	const ng = Object.assign({}, gg)

	if (!ng.phase.done) {
		if (ng.phase.type === 'battle') {
			await ApplyScore(ng.phase, kb)
			setfn(ng)
		} 

		return
	}

	if (ng.phase.type === 'preamble') {
		await FillPlayerBank(ng, kb.hypos, ng.phase.word.choice)
		await LaunchBattle(ng, kb)
		setfn(ng)
		return
	} else if (ng.phase.type === 'battle') {
		MapConcat(ng.wordbank, ng.phase.player.wordbank)
		if (ng.phase.victory) {
			MapConcat(ng.wordbank, ng.phase.opponent.wordbank)
		}
		ng.phase = { 
			type: 'outcome', 
			done: false,
			victory: ng.phase.victory,
			opponent: ng.phase.opponent,
			letterUpgrades: ng.phase.victory ? ng.phase.opponent.level * 10 : 0
		}
		setfn(ng)
		return
	} else if (ng.phase.type === 'outcome') {
		ng.candidates = await kb.candidates(ng.level * 50, (ng.level+1) * 50)
		OutcomeToPreamble(ng)
		setfn(ng)
		return
	}
}

