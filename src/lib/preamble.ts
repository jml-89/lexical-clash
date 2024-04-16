
import  {
	Opponent,
	Opponents
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
	PickRandom
} from './util'

import prand from 'pure-rand'

export interface OpponentPreamble extends Opponent {
	relativeLevel: number
}

export interface WordBooster {
	word: string
	len: number
	samples: string[]
}	

export type PreambleStageType 
	= OpponentPreamble 
	| AbilityCard 
	| BonusCard
	| WordBooster

export interface PreambleStage<T> {
	title: string
	field: string
	options: Map<string, T>
	choice: string
}

export interface Preamble {
	type: 'preamble';
	done: boolean

	prestige: number
	level: number

	opponent: PreambleStage<OpponentPreamble>
	ability: PreambleStage<AbilityCard>
	bonus: PreambleStage<BonusCard>

	reqwords: boolean
	word: PreambleStage<WordBooster>

	stagekey: string
}

export interface PreambleSetup {
	prng: prand.RandomGenerator
	prestige: number
	level: number
}

export function NewPreamble(g: PreambleSetup): Preamble {
	let opts = new Map<string, OpponentPreamble>()

	let lim = 0
	while (opts.size < 3) {
		for (const [k, o] of ShuffleMap(g, Opponents)) {
			const rel = o.level - g.level
			if (Math.abs(rel) > lim) {
				continue
			}

			o.level = (g.prestige * 3) + o.level

			opts.set(k, {
				...o,
				relativeLevel: rel
			})

			if (!(opts.size < 3)) {
				break
			}
		}

		lim += 1
	}

	return {
		type: 'preamble',
		done: false,
		prestige: g.prestige,
		level: g.level,
		opponent: {
			title: 'Select Your Opponent',
			field: 'opponent',
			options: opts,
			choice: ''
		},
		ability: {
			title: 'Select An Ability',
			field: 'ability',
			options: PickRandom(g, AbilityCards, 3),
			choice: ''
		},
		bonus: {
			title: 'Select A Bonus',
			field: 'bonus',
			options: PickRandom(g, BonusCards, 3),
			choice: ''
		},
		reqwords: true,
		word: {
			title: 'Select A Wordbank',
			field: 'word',
			options: new Map<string, WordBooster>(),
			choice: ''
		},
		stagekey: 'opponent'
	}
}

export function PreambleChoice(p: Preamble, s: string): void {
	// This conditional ladder isn't pretty
	// but get type clarity and key existence
	if (p.stagekey === 'opponent') {
		p.opponent.choice = s
		p.stagekey = 'ability'
	} else if (p.stagekey === 'ability') {
		p.ability.choice = s
		p.stagekey = 'bonus'
	} else if (p.stagekey === 'bonus') {
		p.bonus.choice = s
		p.stagekey = 'word'
	} else if (p.stagekey === 'word') {
		p.word.choice = s
		p.done = true
	}
}
