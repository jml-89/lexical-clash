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

import { KnowledgeBase, Shuffle } from './util'

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

interface GameState {
	prng: prand.RandomGenerator

	phase: Phase;

	level: number
	handSize: number;
	letters: Letter[]; 

	wordbank: Map<string, Map<string, Letter[]>>
	abilities: Map<string, AbilityCard>
	bonuses: Map<string, BonusCard>
}

function Upgrade(g: GameState, n: number): void {
	if (n < 1) {
		return
	}

	let indices: number[] = []
	for (let i = 0; i < g.letters.length; i++) {
		indices[i] = i
	}

	Shuffle(g, indices).slice(0, n).forEach((idx) => {
		g.letters[idx].score += 2
		g.letters[idx].level += 1
	})

	g.handSize += 2
	g.level += 1
}

export function EndOutcome(o: Outcome): void {
	o.done = true
}

export function OutcomeToPreamble(g: GameState): void {
	if (g.phase.type !== 'outcome') {
		return
	}
	Upgrade(g, g.phase.letterUpgrades)
	for (const letter of g.letters) {
		if (letter.level === 1) {
			continue
		}
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

	await FillWordbank(kb.hypos, opponent)
	opponent.wordbank = Shuffle(g, opponent.wordbank)

	g.phase = NewBattle({
		handSize: g.handSize, 
		bonuses: g.bonuses,
		abilities: g.abilities,
		opponent: opponent,
		letters: Shuffle(g, g.letters),
		wordbank: squashit(g)
	});

	await ApplyScore(g.phase, kb)
}

export function NewGame(seed: number): GameState {
	const base: PreambleSetup = {
		prng: prand.xoroshiro128plus(seed),
		level: 1
	}

	const preamble = NewPreamble(base)

	return {
		handSize: 9,
		level: 1,
		abilities: new Map<string, AbilityCard>(),
		bonuses: new Map<string, BonusCard>(),
		prng: base.prng,
		phase: preamble,
		letters: ScrabbleDistribution(),
		wordbank: new Map<string, Map<string, Letter[]>>
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

function bankit(g: GameState, words: Letter[][]): void {
	for (const word of words) {
		let str = lettersToString(word)

		let cs = []
		for (const c of str) {
			cs.push(c)
		}
		cs.sort()

		const key = cs.join('')

		let banked = g.wordbank.get(key)
		if (banked === undefined) {
			g.wordbank.set(key, new Map<string, Letter[]>([[str, word]]))
		} else {
			banked.set(str, word)
		}
	}
}

function squashit(g: GameState): Letter[][] {
	let words = []
	for (const [k, vs] of g.wordbank) {
		for (const [j, v] of vs) {
			words.push(v)
		}
	}
	return words
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
		await LaunchBattle(ng, kb)
		setfn(ng)
		return
	} else if (ng.phase.type === 'battle') {
		bankit(ng, ng.phase.player.wordbank)
		if (ng.phase.victory) {
			bankit(ng, ng.phase.opponent.wordbank)
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
		OutcomeToPreamble(ng)
		setfn(ng)
		return
	}
}

