
import  {
	Opponent
} from './opponent'

import  {
	AbilityCard
} from './ability'

import  {
	BonusCard
} from './bonus'

export type PreambleStageType = Opponent | AbilityCard | BonusCard

export interface PreambleStage<T> {
	title: string
	field: string
	options: Map<string, T>
	choice: string
}

export interface Preamble {
	type: 'preamble';
	done: boolean

	opponent: PreambleStage<Opponent>
	ability: PreambleStage<AbilityCard>
	bonus: PreambleStage<BonusCard>

	stagekey: string
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
