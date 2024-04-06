'use client';

import { 
	Letter, 
	lettersToString,
	ScrabbleDistribution
} from './letter.ts';

import { Opponent, Opponents } from './opponent.ts';

import prand from 'pure-rand'

import {
	Battle,
	Outcome,

	NewBattle,
	Submit,
	Place,
	Backspace
} from './battle.ts';

import { BonusCard, BonusCards} from './bonus.ts';
import { AbilityCard, AbilityCards } from './ability.ts';
import { ScoreFunc } from './score.ts'

import { shuffle, pickN } from './util.ts'

// Initially thought TS had ADTs & pattern matching on them
// But appears to be closer to C-style union types
// Still a nice modeling exercise
type Phase 
	= Preamble
	| Battle 
	| Outcome;

type GameState = {
	prng: RandomGenerator

	phase: Phase;

	handSize: number;
	letters: Letter[]; 

	abilities: Map<string, AbilityCard>
	bonuses: Map<string, BonusCard>
}

function Upgrade(g: GameState, n: number): void {
	let indices: number[] = []
	for (let i = 0; i < g.letters.length; i++) {
		indices[i] = i
	}

	const [shuffled, next] = shuffle(indices, g.prng)
	g.prng = next

	shuffled.slice(0, n).forEach((idx) => {
		g.letters[idx].score += 2
		g.letters[idx].upgrades += 1
	})
}

type Preamble = {
	type: 'preamble';

	abilities: Map<string, AbilityCard>;
	bonuses: Map<string, BonusCard>;
	opponents: Map<string, Opponent>;
}

type PreambleChoices = {
	opponents: string
	abilities: string[]
	bonuses: string[]
}

function GpickN<T>(g: GameState, m: Map<string, T>, n: number): Map<string, T> {
	const [res, next] = pickN(m, n, g.prng)
	g.prng = next
	return res
}

function NewPreamble(g: GameState, fn: ScoreFunc): Preamble {
	//const [a, an] = pickN(AbilityCards, 2, g.prng)
	//const [b, bn] = pickN(BonusCards, 2, an)
	//const [c, cn] = pickN(Opponents, 2, bn)
	//g.prng = cn

	return {
		type: 'preamble',
		abilities: GpickN(g, AbilityCards, 3),
		bonuses: GpickN(g, BonusCards, 3),
		opponents: GpickN(g, Opponents, 3)
	}
}

export function EndOutcome(g: GameState, fn: ScoreFunc) {
	Upgrade(g, 5)
	g.phase = NewPreamble(g, fn);
}

export async function EndPreamble(g: GameState, fn: ScoreFunc, choices: PreambleChoices): Promise<void> {
	for (const k of choices.abilities) {
		if (g.abilities.has(k)) {
			g.abilities.get(k).uses += 1
		} else {
			g.abilities.set(k, AbilityCards.get(k))
		}
	}

	for (const k of choices.bonuses) {
		if (g.bonuses.has(k)) {
			g.bonuses.get(k).level += 1
		} else {
			g.bonuses.set(k, BonusCards.get(k))
		}
	}

	const [letters, next] = shuffle(g.letters, g.prng)
	g.prng = next

	g.phase = await NewBattle({
		handSize: g.handSize, 
		bonuses: g.bonuses,
		abilities: g.abilities,
		opponent: Opponents.get(choices.opponents),
		letters: letters
	}, fn);
}

export function NewGame(seed: number): GameState {
	let x = {
		handSize: 12,
		abilities: new Map<string, AbilityCard>(),
		bonuses: new Map<string, BonusCard>(),
		prng: prand.xoroshiro128plus(seed),
	};

	x.phase = NewPreamble(x, undefined)
	x.letters = ScrabbleDistribution()

	return x
}

export async function WithCopy(g: GameState, scorefn: ScoreFunc, fn: any): Promise<GameState> {
	if (g.phase.type === 'preamble') {
		const ng = Object.assign({}, g);
		await fn(ng, scorefn);
		return ng;
	}

	if (g.phase.type === 'outcome') {
		const ng = Object.assign({}, g);
		await fn(ng, scorefn);
		return ng;
	}

	if (g.phase.type === 'battle') {
		const ng = Object.assign({}, g);
		await fn(ng.phase, scorefn);
		return ng;
	}

	return g;
}

