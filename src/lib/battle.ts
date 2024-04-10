// With a bit of luck, everytihng in this file is purely sychronous client code

'use client';

import { 
	Letter, 
	ScrabbleDistribution,
	lettersToString,
	stringToLetters
} from './letter';

import {
	PlayArea
} from './playarea'

import {
	Draw,
	PlaceById,

	UnplaceLast,
	UnplaceAll,
	UnplaceById,

	DiscardAll,
} from './playarea'

import { PlayerProfile, Opponent } from './opponent';

import { 
	AbilityCard, 
	AbilityImpl, 

	AbilityCards, 
	AbilityImpls,
} from './ability'

import {
	BonusCard,
	BonusCards
} from './bonus'

import { 
	Scoresheet, 
} from './score'

import {
	copyMap
} from './util'

export interface Battler extends PlayArea, Opponent {
	health: number

	checkScore: boolean
	scoresheet: Scoresheet;

	abilities: Map<string, AbilityCard>
	bonuses: Map<string, BonusCard>
}

interface BattlerSetup {
	handSize: number
	letters: Letter[]
 	bonuses: Map<string, BonusCard>
	abilities: Map<string, AbilityCard>
	profile: Opponent
}

function NewBattler(bs: BattlerSetup): Battler {
	return {
		health: bs.profile.healthMax,

		handSize: bs.handSize,
		bag: bs.letters,
		hand: [],
		discard: [],
		placed: [],

		abilities: copyMap(bs.abilities),
		bonuses: copyMap(bs.bonuses),

		scoresheet: ZeroScore(),
		checkScore: false,

		...bs.profile
	}

}

export interface Battle {
	type: 'battle'

	done: boolean
	victory: boolean

	round: number

	player: Battler
	opponent: Battler
}

export interface BattleSetup {
	handSize: number
	letters: Letter[]

 	bonuses: Map<string, BonusCard>
	abilities: Map<string, AbilityCard>

	opponent: Opponent
}

export function NewBattle(bs: BattleSetup): Battle {
	const battle: Battle = {
		type: 'battle',

		done: false,
		victory: false,

		round: 0,

		player: NewBattler({
			...bs,
			profile: PlayerProfile
		}),

		opponent: NewBattler({
			handSize: 9,
			letters: bs.letters,
			bonuses: new Map<string, BonusCard>(),
			abilities: new Map<string, AbilityCard>(),
			profile: bs.opponent
		})
	}

	NextRound(battle);
	return battle;
}

function AbilityChecks(b: Battler): void {
	for (const [k, v] of b.abilities) {
		const impl = AbilityImpls.get(k)
		if (impl === undefined) {
			console.log(`No implementation found for bonus ${k}`)
			continue
		}
		v.ok =  v.uses > 0 && impl.pred(b)
	}
}

function UseAbilityReal(g: Battler, key: string): void {
	const impl = AbilityImpls.get(key)
	if (impl === undefined) {
		console.log(`No implementation found for ability ${key}`)
		return
	}

	const ability = g.abilities.get(key)
	if (ability === undefined) {
		console.log(`No card found for ability ${key}`)
		return
	}

	impl.func(g)
	ability.uses -= 1

	g.scoresheet = ZeroScore()
	AbilityChecks(g)
}

export function UseAbility(g: Battle, key: string): void { 
	UseAbilityReal(g.player, key)
}

function NextRound(g: Battle): void {
	g.round = g.round + 1;
	DiscardAll(g.player)
	Draw(g.player);

	DiscardAll(g.opponent)
	Draw(g.opponent)

	//NextWord(g.opponent, g.round)

	AbilityChecks(g.player)

	UpdateScore(g.player)
	//UpdateScore(g.opponent)
}

function NextWord(g: Battler, round: number): void {
	const idx = round % g.words.length
	g.placed = stringToLetters(g.name, g.words[idx])
}

export function Submit(g: Battle): void {
	const diff = g.player.scoresheet.score - g.opponent.scoresheet.score
	if (diff > 0) {
		g.opponent.health -= diff
	} else if (diff < 0) {
		g.player.health += diff
	}

	if (g.player.health <= 0) {
		g.victory = false
		g.done = true
		return
	} 

	if (g.opponent.health <= 0) {
		g.victory = true 
		g.done = true
		return
	}

	NextRound(g);
}

export function Backspace(g: Battle): void {
	UnplaceLast(g.player)
	g.player.scoresheet = ZeroScore()
	AbilityChecks(g.player)
}

export function BackspaceId(g: Battle, id: string): void {
	UnplaceById(g.player, id)
	g.player.scoresheet = ZeroScore()
	AbilityChecks(g.player)
}


export function Wipe(g: Battle): void {
	UnplaceAll(g.player)
	g.player.scoresheet = ZeroScore()
	AbilityChecks(g.player)
}

export function Place(g: Battle, id: string): void {
	PlaceById(g.player, id)
	g.player.scoresheet = ZeroScore()
	AbilityChecks(g.player)
}

function UpdateScore(g: Battler): void {
	g.checkScore = true
}

export function UpdateScores(g: Battle): void {
	g.player.checkScore = true
}

function ZeroScore(): Scoresheet {
	return {
		checked: false,
		ok: false,
		score: 0,
		adds: [],
		muls: [],
		totalAdd: 0,
		totalMul: 0
	}
}

