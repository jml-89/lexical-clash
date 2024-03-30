'use client';

import { 
	Letter, 
	lettersToString 
} from './letter.ts';

import { Opponent, Opponents } from './opponent.ts';

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

// Initially thought TS had ADTs & pattern matching on them
// But appears to be closer to C-style union types
// Still a nice modeling exercise
type Phase 
	= Preamble
	| Battle 
	| Outcome;

type GameState = {
	phase: Phase;

	drawNum: number;

	abilities: Map<string, AbilityCard>
	bonuses: Map<string, BonusCard>
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

function NewPreamble(): Preamble {
	return {
		type: 'preamble',

		abilities: AbilityCards,
		bonuses: BonusCards,
		opponents: Opponents
	};
}

export function NextPreamble(g: GameState, fn: ScoreFunc) {
	g.phase = NewPreamble();
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
			g.bonuses.get(k).uses += 1
		} else {
			g.bonuses.set(k, BonusCards.get(k))
		}
	}

	g.phase = await NewBattle({
		drawNum: g.drawNum, 
		bonuses: g.bonuses,
		abilities: g.abilities,
		opponent: Opponents.get(choices.opponents),
	}, fn);
}

export function NewGame(): GameState {
	return {
		phase: NewPreamble(),
		drawNum: 12,
		abilities: new Map<string, AbilityCard>(),
		bonuses: new Map<string, BonusCard>(),
	};
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

/*
async function CheckScore(g: GameState): number {
	if (g.phase.type !== 'battle') {
		return 0;
	}

	if (g.phase.placed.length === 0) {
		return 0;
	}

	const word = lettersToString(g.phase.placed);
	if (await g.checkfn(word)) {
		return ScoreWord(g.bonuses, g.phase.placed);
	}

	return 0;
}
*/

