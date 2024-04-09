'use server'

import { 
	Letter, 
	lettersToString 
} from './letter'

import { Opponent } from './opponent'

import { 
	BonusCard, 
	BonusImpl,
	BonusImpls 
} from './bonus'

import { 
	WordCheck, 
	isRelatedWords 
} from './wordnet'

// Scoring has to take place on the server
// Why?
// Server has the dictionary
// Feasible to load dictionary on client if small
// But eventually dictionary can grow to be large
// Hundreds of megabytes -- possibly eventually maybe

export interface Scoresheet {
	checked: boolean
	ok: boolean

	score: number

	totalAdd: number
	totalMul: number
	adds: ScoreModifier[]
	muls: ScoreModifier[]
}

export interface ScoreModifier {
	source: string
	value: number
}

// ScoreWord really just expects a Battle object
// But nice to pare it down to what really matters
// In case of some future changes to layout
export interface ScoreInput {
	placed: Letter[]
	bonuses: Map<string, BonusCard>
}

export type ScoreFunc = (input: ScoreInput, opp: Opponent) => Promise<Scoresheet>

export async function ScoreWord(input: ScoreInput, opponent: Opponent): Promise<Scoresheet> {
	let sheet: Scoresheet = {
		checked: true, 
		ok: true, 
		score: 0,
		totalAdd: 0,
		totalMul: 0,
		adds: [],
		muls: []
	}

	sheet.adds.push({
		source: 'Letter Score Sum',
		value: simpleScore(input.placed)
	})

	sheet.muls.push({
		source: 'Base Mult.',
		value: 1
	})

	const word = lettersToString(input.placed)
	sheet.ok = await WordCheck(word)
	if (!sheet.ok) {
		return sheet
	}

	for (const [k, v] of input.bonuses) {
		const impl = BonusImpls.get(k)
		if (impl === undefined) {
			console.log(`Could not find ${k} in BonusImpls:`, BonusImpls)
			continue
		}

		const val = impl.fn(v.level, input.placed)
		if (val !== 0) {
			sheet.adds.push({ 
				source: v.name,
				value: val
			})
		}
	}

	for (const weakness of opponent.weaknesses) {
		const hit = await isRelatedWords('hypernym', weakness, word)
		if (!hit) {
			continue
		}
		sheet.muls.push({
			source: `Weakness: ${weakness}`,
			value: 1
		})
	}

	for (const strength of opponent.strengths) {
		const hit = await isRelatedWords('hypernym', strength, word)
		if (!hit) {
			continue
		}
		sheet.muls.push({
			source: `strength: ${strength}`,
			value: -1
		})
	}

	sumScore(sheet)
	return sheet
}

function simpleScore(word: Letter[]): number {
	return word.reduce((xs, x) => xs + x.score, 0)
}

function sumScore(s: Scoresheet) {
	const add = (xs: number, x: ScoreModifier): number => xs + x.value
	s.totalAdd = s.adds.reduce(add, 0)
	s.totalMul = s.muls.reduce(add, 0)
	s.score = s.totalAdd * s.totalMul
}

