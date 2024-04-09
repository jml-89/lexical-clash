'use client';

import { 
	Letter, 
	lettersToString,
	ScrabbleDistribution
} from './letter';

import { Opponent, Opponents } from './opponent';

import prand from 'pure-rand'

import {
	Battle,

	NewBattle,
	Submit,
	Place,
	Backspace,
	Wipe
} from './battle';

import { BonusCard, BonusCards} from './bonus';
import { AbilityCard, AbilityCards } from './ability';
import { ScoreFunc } from './score'

import { shuffle, pickN } from './util'

import {
	Preamble
} from './preamble'

// Initially thought TS had ADTs & pattern matching on them
// But appears to be closer to C-style union types
// Still a nice modeling exercise
export type Phase 
	= Preamble
	| Battle 
	| Outcome

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

	handSize: number;
	letters: Letter[]; 

	abilities: Map<string, AbilityCard>
	bonuses: Map<string, BonusCard>
}

interface hasprng {
	prng: prand.RandomGenerator
}

// saves on managing the prng mutations, a little bit
function GpickN<T>(g: hasprng, m: Map<string, T>, n: number): Map<string, T> {
	const [res, next] = pickN(m, n, g.prng)
	g.prng = next
	return res
}

function NewPreamble(g: hasprng): Preamble {
	return {
		type: 'preamble',
		done: false,
		opponent: 
			{
				title: 'Select Your Opponent',
				field: 'opponent',
				options: GpickN(g, Opponents, 3),
				choice: ''
			},
		ability:
			{
				title: 'Select An Ability',
				field: 'ability',
				options: GpickN(g, AbilityCards, 3),
				choice: ''
			},
		bonus:
			{
				title: 'Select A Bonus',
				field: 'bonus',
				options: GpickN(g, BonusCards, 3),
				choice: ''
			},
		stagekey: 'opponent'
	}
}

function Upgrade(g: GameState, n: number): void {
	if (n < 1) {
		return
	}

	let indices: number[] = []
	for (let i = 0; i < g.letters.length; i++) {
		indices[i] = i
	}

	const [shuffled, next] = shuffle(indices, g.prng)
	g.prng = next

	shuffled.slice(0, n).forEach((idx) => {
		g.letters[idx].score += 2
		g.letters[idx].level += 1
	})
}

export function EndOutcome(o: Outcome): void {
	o.done = true
}

export function OutcomeToPreamble(g: GameState): void {
	if (g.phase.type !== 'outcome') {
		return
	}
	console.log(`Time to upgrade ${g.phase.letterUpgrades} letters`)
	Upgrade(g, g.phase.letterUpgrades)
	for (const letter of g.letters) {
		if (letter.level === 1) {
			continue
		}
		console.log(letter)
	}
	g.phase = NewPreamble(g);
}

export async function LaunchBattle(g: GameState, scorefn: ScoreFunc): Promise<void> {
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

	const [letters, next] = shuffle(g.letters, g.prng)
	g.prng = next

	g.phase = NewBattle({
		handSize: g.handSize, 
		bonuses: g.bonuses,
		abilities: g.abilities,
		opponent: Opponents.get(g.phase.opponent.choice) as Opponent,
		letters: letters
	});

	await ApplyScore(g.phase, scorefn)
}

export function NewGame(seed: number): GameState {
	const base: hasprng = {
		prng: prand.xoroshiro128plus(seed)
	}

	const preamble = NewPreamble(base)

	return {
		handSize: 12,
		abilities: new Map<string, AbilityCard>(),
		bonuses: new Map<string, BonusCard>(),
		prng: base.prng,
		phase: preamble,
		letters: ScrabbleDistribution() 
	}
}

async function ApplyScore(b: Battle, scorefn: ScoreFunc): Promise<void> {
	if (b.player.checkScore) {
		b.player.scoresheet = await scorefn(b.player, b.opponent)
		b.player.checkScore = false
	} 
	if (b.opponent.checkScore) {
		b.opponent.scoresheet = await scorefn(b.opponent, b.player)
		b.opponent.checkScore = false
	}
}

export async function BattleFn(g: GameState, scorefn: ScoreFunc, fn: (b: Battle) => void): Promise<GameState> {
	const ng = Object.assign({}, g);
	if (ng.phase.type !== 'battle') {
		return ng
	}

	fn(ng.phase);

	if (ng.phase.done) {
		ng.phase = { 
			type: 'outcome', 
			done: false,
			victory: ng.phase.victory,
			opponent: ng.phase.opponent,
			letterUpgrades: ng.phase.victory ? ng.phase.opponent.level * 5 : 0
		}
	} else {
		await ApplyScore(ng.phase, scorefn)
	}

	return ng;
}

export async function PreambleFn(g: GameState, scorefn: ScoreFunc, fn: (p: Preamble) => void): Promise<GameState> {
	const ng = Object.assign({}, g);
	if (ng.phase.type !== 'preamble') {
		return ng
	}

	fn(ng.phase);

	if (g.phase.done) {
		await LaunchBattle(ng, scorefn)
	}

	return ng;
}

export function OutcomeFn(g: GameState, fn: (o: Outcome) => void): GameState {
	const ng = Object.assign({}, g);
	if (ng.phase.type !== 'outcome') {
		return ng
	}

	fn(ng.phase)

	if (g.phase.done) {
		OutcomeToPreamble(ng)
	}

	return ng;
}

