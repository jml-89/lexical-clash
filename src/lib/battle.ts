'use client';

import { 
	Letter, 
	ScrabbleDistribution,
	lettersToString,
	stringToLetters
} from './letter.ts';

import {
	DiscardAll,
	Draw,
	UnplaceLast,
	PlaceById
} from './playarea.ts'

import { Opponent } from './opponent.ts';

import { 
	AbilityCard, 
	AbilityCards, 
	AbilityImpl, 
	AbilityImpls,
} from './ability.ts'

import {
	BonusCard,
	BonusCards
} from './bonus.ts'

import { 
	Scoresheet, 
	ScoreFunc,
} from './score.ts'

export type Battle = {
	type: 'battle';

	round: number;

	handSize: number;
	placed: Array<Letter>;
	hand: Array<Letter>;
	bag: Array<Letter>;
	discard: Array<Letter>;

	healthMax: number;
	health: number;

	opponent: Opponent;
	oppHealth: number;
	oppPlaced: Array<Letter>;

	abilities: Map<string, AbilityCard>
	bonuses: BonusCard[]

	scoresheet: Scoresheet;
}

export type Outcome = {
	type: 'outcome';

	victory: boolean;
	roundsPlayed: number;
}

export interface BattleSetup {
	handSize: number
 	bonuses: BonusCard[]
	abilities: Map<string, AbilityCard>
	opponent: Opponent
	letters: Letter[]
}

export async function NewBattle(bs: BattleSetup, fn: ScoreFunc): Promise<Battle> {
	const battle = {
		type: 'battle',
		round: 0,
		health: 10,
		healthMax: 10,

		handSize: bs.handSize,

		bag: bs.letters,
		hand: [],
		discard: [],
		placed: [],

		opponent: bs.opponent,
		oppHealth: bs.opponent.healthMax,
		oppPlaced: [],
		oppPlacedScore: ZeroScore(),

		abilities: new Map<string, AbilityCard>(),
		bonuses: bs.bonuses,

		scoresheet: ZeroScore()
	}

	for (const [k, v] of bs.abilities) {
		battle.abilities.set(k, Object.assign({}, v))
	}

	await NextRound(battle, fn);
	return battle;
}

function AbilityChecks(g: Battle) {
	for (const [k, v] of g.abilities) {
		v.ok =  v.uses > 0 && AbilityImpls.get(k).pred(g)
	}
}

export function UseAbility(g: Battle, fn: ScoreFunc, key: string) { 
	console.log(key)
	AbilityImpls.get(key).func(g)
	g.abilities.get(key).uses -= 1

	g.scoresheet.player = ZeroScore().player
	AbilityChecks(g)
}

async function NextRound(g: Battle, fn: ScoreFunc): Promise<void> {
	g.round = g.round + 1;
	DiscardAll(g)
	Draw(g);
	NextOpponentWord(g);
	AbilityChecks(g)
	await UpdateScores(g, fn)
}

function NextOpponentWord(g: Battle) {
	const idx = g.round % g.opponent.words.length;
	g.oppPlaced = stringToLetters(g.opponent.name, g.opponent.words[idx])
}

export async function UpdateScores(g: Battle, fn: ScoreFunc) {
	g.scoresheet = await fn(g)
}

export async function Submit(g: Battle, fn: ScoreFunc) {
	const diff = g.scoresheet.player.score - g.scoresheet.opponent.score 
	if (diff > 0) {
		g.oppHealth -= diff;
	} else if (diff < 0) {
		g.health += diff;
	}

	if (g.health <= 0) {
		g.type = 'outcome'
		g.victory = false
		g.roundsPlayed = g.round
		return
	} 

	if (g.oppHealth <= 0) {
		g.type = 'outcome'
		g.victory = true
		g.roundsPlayed = g.round
		return
	}

	await NextRound(g, fn);
}

export function Backspace(g: Battle, fn: ScoreFunc) {
	UnplaceLast(g)
	g.scoresheet.player = ZeroScore().player
	AbilityChecks(g)
}

export function Place(g: Battle, fn: ScoreFunc, id: string) {
	PlaceById(g, id)
	g.scoresheet.player = ZeroScore().player
	AbilityChecks(g)
}

function ZeroScore(): Scoresheet {
	return {
		player: {
			checked: false,
			ok: false,
			score: 0,
			adds: [],
			muls: []
		},
		opponent: {
			checked: false,
			ok: false,
			score: 0,
			adds: [],
			muls: []
		}
	}
}

