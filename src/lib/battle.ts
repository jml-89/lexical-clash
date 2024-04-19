'use client';

import { 
	Letter, 
	ScrabbleDistribution,
	lettersToString,
	stringToLetters,
	simpleScore
} from './letter';

import {
	PlayArea
} from './playarea'

import {
	Draw,
	PlaceById,
	PlaceWord,

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
	ScoreWord
} from './score'

import {
	CopyMap,
	ScoredWord,
	KnowledgeBase
} from './util'

export interface Battler extends PlayArea, Opponent {
	health: number

	checking: boolean
	scoresheet: Scoresheet;

	abilities: Map<string, AbilityCard>
	bonuses: Map<string, BonusCard>

	wordMatches: string[]
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
		placed: [],

		abilities: CopyMap(bs.abilities),
		bonuses: CopyMap(bs.bonuses),

		checking: false,
		scoresheet: ZeroScore(),
		wordMatches: [],

		...bs.profile
	}

}

export interface Battle {
	type: 'battle'

	kb: KnowledgeBase
	done: boolean
	victory: boolean

	round: number

	player: Battler
	opponent: Battler
}

export interface BattleSetup {
	handSize: number
	letters: Letter[]
	kb: KnowledgeBase

	wordbank: Map<string, ScoredWord>

 	bonuses: Map<string, BonusCard>
	abilities: Map<string, AbilityCard>

	opponent: Opponent
}

export async function NewBattle(bs: BattleSetup): Promise<Battle> {
	const battle: Battle = {
		type: 'battle',

		kb: bs.kb,

		done: false,
		victory: false,

		round: 0,

		player: NewBattler({
			...bs,
			profile: PlayerProfile,
		}),

		opponent: NewBattler({
			handSize: 9,
			letters: bs.letters,
			bonuses: new Map<string, BonusCard>(),
			abilities: new Map<string, AbilityCard>(),
			profile: bs.opponent,
		})
	}

	battle.player.wordbank = bs.wordbank

	await NextRound(battle);
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
	WordbankCheck(g.player)
}

function WordbankCheck(g: Battler): void {

	const found: ScoredWord[] = []

	let pm = new Map<string, number>()
	for (const letter of g.hand) {
		const c = letter.char.toLowerCase()
		const n = pm.get(c)
		pm.set(c, n === undefined ? 1 : n+1)
	}

	for (const [str, scoredword] of g.wordbank) {
		let wm = new Map<string, number>()
		for (const c of scoredword.word) {
			const n = wm.get(c)
			wm.set(c, n === undefined ? 1 : n+1)
		}

		let good = true
		for (const [c, n] of wm) {
			const m = pm.get(c)
			good = good && m !== undefined && n <= m
			if (!good) {
				break
			}
		}

		if (good) {
			found.push(scoredword)
		}
	}

	found.sort((a, b) => b.score - a.score)
	g.wordMatches = found.map((a) => a.word).slice(0, 20)
}

async function NextRound(g: Battle): Promise<void> {
	g.round = g.round + 1;
	DiscardAll(g.player)
	Draw(g.player);
	WordbankCheck(g.player)

	DiscardAll(g.opponent)
	Draw(g.opponent)


	NextWord(g.opponent, g.round)

	AbilityChecks(g.player)

	await UpdateScore(g.player, g.opponent, g.kb)
	await UpdateScore(g.opponent, g.player, g.kb)
}

export function NextWord(g: Battler, round: number): void {
	const keys = [ ...g.wordbank.keys() ]
	const choice = g.wordbank.get(keys[round % keys.length])
	if (choice !== undefined) {
		g.placed = stringToLetters(g.name, choice.word)
	}
}

export async function Submit(g: Battle): Promise<void> {
	const diff = g.player.scoresheet.score - g.opponent.scoresheet.score
	if (diff > 0) {
		g.opponent.health -= diff
	} else if (diff < 0) {
		g.player.health += diff
	}

	const str = lettersToString(g.player.placed)
	if (!g.player.wordbank.has(str)) {
		// This is a little goofy, but the player may have used enhanced letters
		// To get a "true" score, have to do this
		g.player.wordbank.set(str, { 
			word: str,
			score: simpleScore(stringToLetters('tmp', str))
		})
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

	await NextRound(g);
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

export async function PlaceWordbank(g: Battle, id: string): Promise<void> {
	UnplaceAll(g.player)
	PlaceWord(g.player, id)
	g.player.scoresheet = ZeroScore()
	AbilityChecks(g.player)
}

async function UpdateScore(g: Battler, o: Battler, kb: KnowledgeBase): Promise<void> {
	g.scoresheet = await ScoreWord(kb, g, o)
}

export async function UpdateScores(g: Battle): Promise<void> {
	await UpdateScore(g.player, g.opponent, g.kb)
	g.player.checking = false
}

export function Checking(g: Battle): void {
	g.player.checking = true
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

