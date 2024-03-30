'use client';

import { 
	Letter, 
	ScrabbleDistribution,
	lettersToString,
	stringToLetters
} from './letter.ts';

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
	drawNum: number;

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
	drawNum: number
 	bonuses: BonusCard[]
	abilities: Map<string, AbilityCard>
	opponent: Opponent
}

export async function NewBattle(bs: BattleSetup, fn: ScoreFunc): Promise<Battle> {
	const battle = {
		type: 'battle',
		round: 0,
		health: 10,
		healthMax: 10,

		drawNum: bs.drawNum,

		bag: ScrabbleDistribution(),
		hand: [],
		discard: [],
		placed: [],

		opponent: bs.opponent,
		oppHealth: bs.opponent.healthMax,
		oppPlaced: [],
		oppPlacedScore: ZeroScore(),

		abilities: bs.abilities,
		bonuses: bs.bonuses,

		scoresheet: ZeroScore()
	};

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
	AbilityChecks(g)
}

async function NextRound(g: Battle, fn: ScoreFunc): Promise<void> {
	g.round = g.round + 1;
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

	g.discard = g.discard.concat(g.placed).concat(g.hand);
	g.hand = [];
	g.placed = [];
	g.oppPlaced = [];

	await NextRound(g, fn);
}

function Draw(g: Battle) {
	g.hand = g.hand.concat(g.bag.slice(0,g.drawNum));
	g.bag = g.bag.slice(g.drawNum);
}

export function Backspace(g: Battle, fn: ScoreFunc) {
	if (g.placed.length === 0) {
		return g;
	}

	const li = g.placed.length - 1;
	const idx = g.hand.findIndex((letter) => letter.id === g.placed[li].id);

	g.hand[idx].available = true;
	g.placed = g.placed.slice(0, li);
	g.scoresheet.player = ZeroScore().player
	AbilityChecks(g)
}

export function Place(g: Battle, fn: ScoreFunc, c: string) {
	const idx = g.hand.findIndex((letter) => 
		letter.available && letter.id === c 
	);
	if (idx === -1) {
		return;
	}

	g.placed = g.placed.concat([g.hand[idx]]);
	g.hand[idx].available = false;
	AbilityChecks(g)
	g.scoresheet.player = ZeroScore().player
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

