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

	totalAdd: number
	totalMul: number
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
	bonuses: Map<string, BonusCard>
	opponent: Opponent // need this for weaknesses, strengths, immunities
	oppPlaced: Letter[] // we score opponent's word too
}

export type ScoreFunc = (input: ScoreInput) => Promise<Scoresheet>

export async function ScoreWord(input: ScoreInput): Promise<Scoresheet> {
	let sheet = {
		opponent: {
			checked: true, 
			ok: true, 
			score: 0,
			totalAdd: 0,
			totalMul: 0,
			adds: [],
			muls: []
		},
		player: {
			checked: true, 
			ok: false, 
			score: 0, 
			totalAdd: 0,
			totalMul: 0,
			adds: [],
			muls: [] 
		}
	}


	sheet.player.adds.push({
		source: 'Letter Score Sum',
		value: simpleScore(input.placed)
	})

	sheet.opponent.adds.push({
		source: 'Letter Score Sum',
		value: simpleScore(input.oppPlaced)
	})

	for (const who of ['player', 'opponent']) {
		sheet[who].muls.push({
			source: 'Base Mult.',
			value: 1
		})
	}

	const word = lettersToString(input.placed)
	sheet.player.ok = await WordCheck(word)
	if (!sheet.player.ok) {
		return sheet
	}

	for (const [k, v] of input.bonuses) {
		if (!BonusImpls.has(k)) {
			console.log(`Could not find ${k} in BonusImpls:`, BonusImpls)
			continue
		}

		const impl = BonusImpls.get(k)
		const val = impl.fn(v.level, input.placed)
		if (val !== 0) {
			sheet.player.adds.push({ 
				source: v.name,
				value: val
			})
		}
	}

	for (const weakness of input.opponent.weaknesses) {
		const hit = await isRelatedWords('hypernym', weakness, word)
		if (!hit) {
			continue
		}
		sheet.player.muls.push({
			source: `Weakness: ${weakness}`,
			value: 1
		})
	}

	for (const strength of input.opponent.strengths) {
		const hit = await isRelatedWords('hypernym', strength, word)
		if (!hit) {
			continue
		}
		sheet.player.muls.push({
			source: `strength: ${strength}`,
			value: -1
		})
	}

	for (const who of ['player', 'opponent']) {
		sheet[who].totalAdd = sheet[who].adds.reduce((xs, x) => xs+x.value, 0)
		sheet[who].totalMul = sheet[who].muls.reduce((xs, x) => xs+x.value, 0)
		sheet[who].score = sheet[who].totalAdd * sheet[who].totalMul
	}

	return sheet
}

function simpleScore(word: Letter[]): number {
	return word.reduce((xs, x) => xs + x.score, 0)
}

