
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
	GpickN
} from './util'

import prand from 'pure-rand'

export interface OpponentPreamble extends Opponent {
	relativeLevel: number
}

export type PreambleStageType = OpponentPreamble | AbilityCard | BonusCard

export interface PreambleStage<T> {
	title: string
	field: string
	options: Map<string, T>
	choice: string
}

export interface Preamble {
	type: 'preamble';
	done: boolean
	level: number

	opponent: PreambleStage<OpponentPreamble>
	ability: PreambleStage<AbilityCard>
	bonus: PreambleStage<BonusCard>

	stagekey: string
}

export interface PreambleSetup {
	prng: prand.RandomGenerator
	level: number
}

export function NewPreamble(g: PreambleSetup): Preamble {
	const opponents = new Map<string, OpponentPreamble>()
	for (const [k, o] of Opponents) {
		const rel = o.level - g.level
		if (rel < -1) {
			continue
		}

		opponents.set(k, {
			...o,
			relativeLevel: rel
		})
	}

	return {
		type: 'preamble',
		done: false,
		level: g.level,
		opponent: {
			title: 'Select Your Opponent',
			field: 'opponent',
			options: GpickN(g, opponents, 3),
			choice: ''
		},
		ability: {
			title: 'Select An Ability',
			field: 'ability',
			options: GpickN(g, AbilityCards, 3),
			choice: ''
		},
		bonus: {
			title: 'Select A Bonus',
			field: 'bonus',
			options: GpickN(g, BonusCards, 3),
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
		p.done = true
	}
}
