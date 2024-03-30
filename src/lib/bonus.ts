'use client'

import { Letter } from './letter.ts';

// Bonuses are modifiers to the score produced by a given word
// If I can get a good set of data going, it can proc off cool things like
// - Etymology
// - Synonyms
// - Associations
// I like that direction, making the game more about words and meanings
//
// Eventually they'll have graphics, levels, etc.

interface BonusCard {
	key: string
	name: string
	desc: string
}

interface BonusImpl {
	fn: (word: Array<Letter>) => number;
}

interface BonusBase {
	key: string
	name: string
	desc: string
	fn: (word: Array<Letter>) => number;
}

const base: BonusBase[] = [
	{
		key: "double",
		name: "Double Letter Bonus",
		desc: "+2 points when the same letter occurs twice in a row, e.g. gli[mm]er, h[oo]t",
		fn: (word: Array<Letter>): number => {
			let n = 0;
			let bc = '';
			for (const c of word) {
				if (c.char === bc) {
					n += 2;
				}
				bc = c.char
			}
			return n;
		}
	},
	{
		key: "thth",
		name: "Lispers Torment",
		desc: "+2 points when a word contains the sequence [th]",
		fn: (word: Array<Letter>): number => {
			let n = 0;
			let bc = '';
			for (const c of word) {
				if (bc === 't' && c.char === 'h') {
					n += 2;
				}
				bc = c.char
			}
			return n;
		}
	}
];

export const BonusCards = new Map(base.map((bonus) => [bonus.key, {
	key: bonus.key,
	name: bonus.name,
	desc: bonus.desc,
}]))

export const BonusImpls = new Map(base.map((bonus) => [bonus.key, { fn: bonus.fn }]))

