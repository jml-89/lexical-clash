'use server'

import { 
	Letter, 
	lettersToString 
} from './letter.ts'

import { Opponent } from './opponent.ts'

import { 
	BonusCard, 
	BonusImpl,
	BonusImpls 
} from './bonus.ts'

import { 
	WordCheck, 
	isRelatedWords 
} from './wordnet.ts'

// Scoring has to take place on the server
// Why?
// Server has the dictionary
// Feasible to load dictionary on client if small
// But eventually dictionary can grow to be large
// Hundreds of megabytes -- possibly eventually maybe

interface Scoresheet {
	player: Scoreline
	opponent: Scoreline
}

interface Scoreline {
	checked: boolean
	ok: boolean
	score: number
	adds: ScoreModifier[]
	muls: ScoreModifier[]
}

interface ScoreModifier {
	source: string
	value: number
}

// ScoreWord really just expects a Battle object
// But nice to pare it down to what really matters
// In case of some future changes to layout
interface ScoreInput {
	placed: Letter[]
	bonuses: BonusCard[]
	opponent: Opponent // need this for weaknesses, strengths, immunities
	oppPlaced: Letter[] // we score opponent's word too
}

export type ScoreFunc = (input: ScoreInput) => Promise<Scoresheet>

export async function ScoreWord(input: ScoreInput): Promise<Scoresheet> {
	let sheet = {
		opponent: {
			checked: true, 
			ok: true, 
			score: simpleScore(input.oppPlaced), 
			adds: [],
			muls: []
		},
		player: {
			checked: true, 
			ok: false, 
			score: 0, 
			adds: [],
			muls: [] 
		}
	}

	const word = lettersToString(input.placed)
	sheet.player.ok = await WordCheck(word)
	if (!sheet.player.ok) {
		return sheet
	}

	sheet.player.adds.push({ 
		source: 'base',
		value: simpleScore(input.placed)
	})

	for (const weakness of input.opponent.weaknesses) {
		const hit = await isRelatedWords('hypernym', weakness, word)
		if (!hit) {
			continue
		}
		sheet.player.muls.push({
			source: `weakness to ${weakness}`,
			value: 1
		})
	}

	const sum = sheet.player.adds.reduce((xs, x) => xs+x.value, 0)
	const mul = sheet.player.muls.reduce((xs, x) => xs+x.value, 1)
	sheet.player.score = sum * mul + 100

	return sheet
}

function simpleScore(word: Letter[]): number {
	return word.reduce((xs, x) => xs + x.score, 0)
}

