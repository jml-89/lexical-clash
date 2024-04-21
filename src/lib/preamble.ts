
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
	KnowledgeBase
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
	kb: KnowledgeBase

	level: number

	opponent: PreambleStage<OpponentPreamble>
	ability: PreambleStage<AbilityCard>
	bonus: PreambleStage<BonusCard>

	word: PreambleStage<WordBooster>

	stagekey: string
}

export interface PreambleSetup {
	prng: prand.RandomGenerator
	iter: number

	level: number
	kb: KnowledgeBase
	opponents: Map<string, Opponent>
}

export async function NewPreamble(g: PreambleSetup): Promise<Preamble> {
	const xs = await g.kb.candidates(
		g.level * 200,
		(g.level + 1) * 300,
		10,
		5
	)

	let wordboosters = new Map<string, WordBooster>()
	for (const x of xs) {
		let words = (await g.kb.hypos(x)).map((a) => a.word)
		words.sort((a, b) => a.length - b.length)
		wordboosters.set(x, {
			word: x,
			len: words.length,
			samples: words
		})
	}

	let opts = new Map<string, OpponentPreamble>()

	let lim = 0
	while (opts.size < 3) {
		for (const [k, o] of ShuffleMap(g, g.opponents)) {
			const rel = o.level - g.level
			if (Math.abs(rel) > lim) {
				continue
			}

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
		level: g.level,
		kb: g.kb,
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
		word: {
			title: 'Select A Wordbank',
			field: 'word',
			options: wordboosters,
			choice: ''
		},
		stagekey: 'opponent'
	}
}

export function PreambleChoice(p: Preamble, k: string, s: string): void {
	// This conditional ladder isn't pretty
	// but get type clarity and key existence
	if (k === 'opponent') {
		p.opponent.choice = s
		p.stagekey = 'ability'
	} else if (k === 'ability') {
		p.ability.choice = s
		p.stagekey = 'bonus'
	} else if (k === 'bonus') {
		p.bonus.choice = s
		p.stagekey = 'word'
	} else if (k === 'word') {
		p.word.choice = s
		p.done = true
	}
}

