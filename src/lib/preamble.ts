//preamble
// The steps before battle, where the player selects
// - Opponent
// - Ability (new or upgrade)
// - Bonus (new or upgrade)
// - Wordbank Booster (new)
// Originally more generically written
// Found it easier to lean on the type system by writing more specific function calls

import  {
	Opponent,
} from './opponent'

import  {
	AbilityCard,
	AbilityCards
} from './ability'

import  {
	BonusCard,
	BonusCards
} from './bonus'

import {
	ShuffleMap,
	PickRandom,
	KnowledgeBase,
	ScoredWord,
	HyperSet
} from './util'

import prand from 'pure-rand'

export type PreambleStageType 
	= Opponent
	| AbilityCard 
	| BonusCard
	| HyperSet

export interface PreambleStage<T> {
	options: Map<string, T>
	choice?: T
}

export interface Preamble {
	type: 'preamble';
	done: boolean
	kb: KnowledgeBase

	level: number

	opponent: PreambleStage<Opponent>
	ability: PreambleStage<AbilityCard>
	bonus: PreambleStage<BonusCard>

	word: PreambleStage<HyperSet>

	stagekey: string
}

export interface PreambleSetup {
	prng: prand.RandomGenerator
	iter: number

	level: number
	kb: KnowledgeBase

	opponents: Map<string, Opponent>

	// Abilities and bonuses the player already has
	abilities: Map<string, AbilityCard>
	bonuses: Map<string, BonusCard>
}

async function assembleWordBoosters(g: PreambleSetup): Promise<Map<string, HyperSet>> {
	const xs = await g.kb.candidates(
		g.level * 200,
		(g.level + 1) * 300,
		10,
		5
	)

	let wordboosters = new Map<string, HyperSet>()
	for (const x of xs) {
		x.hyponyms.sort((a, b) => a.word.length - b.word.length)
		wordboosters.set(x.hypernym, x)
	}

	return wordboosters
}

function assembleOpponents(g: PreambleSetup): Map<string, Opponent> {
	let opts = new Map<string, Opponent>()

	let lim = 0
	while (opts.size < 3) {
		for (const [k, o] of ShuffleMap(g, g.opponents)) {
			const rel = o.level - g.level
			if (Math.abs(rel) > lim) {
				continue
			}

			opts.set(k, o)

			if (!(opts.size < 3)) {
				break
			}
		}

		lim += 1
	}

	return opts
}

function assembleAbilities(g: PreambleSetup): Map<string, AbilityCard> {
	const picks = PickRandom(g, AbilityCards, 3)
	let ticks = new Map<string, AbilityCard>()
	for (const [key, pick] of picks) {
		let upgrade = g.abilities.get(key)
		if (upgrade) {
			upgrade = { ...upgrade }
			upgrade.uses += 1
			ticks.set(key, upgrade)
		} else {
			ticks.set(key, pick)
		}
	}
	return ticks
}

function assembleBonuses(g: PreambleSetup): Map<string, BonusCard> {
	const picks = PickRandom(g, BonusCards, 3)
	let ticks = new Map<string, BonusCard>()
	for (const [key, pick] of picks) {
		let upgrade = g.bonuses.get(key)
		if (upgrade) {
			upgrade = { ...upgrade }
			upgrade.level += 1
			ticks.set(key, upgrade)
		} else {
			ticks.set(key, pick)
		}
	}
	return ticks
}

export async function NewPreamble(g: PreambleSetup): Promise<Preamble> {
	return {
		type: 'preamble',
		done: false,
		level: g.level,
		kb: g.kb,
		opponent: {
			options: assembleOpponents(g),
		},
		ability: {
			options: assembleAbilities(g), 
		},
		bonus: {
			options: assembleBonuses(g), 
		},
		word: {
			options: await assembleWordBoosters(g),
		},
		stagekey: 'opponent'
	}
}

export async function ChooseOpponent(p: Preamble, o: Opponent): Promise<void> {
	p.opponent.choice = o
	p.stagekey = 'ability'
}

export async function ChooseAbility(p: Preamble, a: AbilityCard): Promise<void> {
	p.ability.choice = a
	p.stagekey = 'bonus'
}

export async function ChooseBonus(p: Preamble, b: BonusCard): Promise<void> {
	p.bonus.choice = b
	p.stagekey = 'word'
}

export async function ChooseWord(p: Preamble, w: HyperSet): Promise<void> {
	p.word.choice = w
	p.done = true
}

