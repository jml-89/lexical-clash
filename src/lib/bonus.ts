import { Letter, lettersToString } from './letter';

// Bonuses are modifiers to the score produced by a given word
// If I can get a good set of data going, it can proc off cool things like
// - Etymology
// - Synonyms
// - Associations
// I like that direction, making the game more about words and meanings
//
// Eventually they'll have graphics, levels, etc.
//
// Bonuses may rely on information that only resides server side
// As such they need to be asynchronous

// Presentation / simple representation of a bonus
// Having the function as part of this can cause issues with server/client proxying
// At least that's what I encountered a time or two
export interface BonusCard {
	key: string
	name: string
	desc: string
	level: number
}

type relationFunc = (relation: string, left: string, right: string) => Promise<boolean>

export interface BonusImpl {
	fn: (rf: relationFunc, level: number, word: Letter[]) => Promise<number>;
}

interface BonusBase {
	key: string
	name: string
	desc: string
	fn: (rf: relationFunc, level: number, word: Letter[]) => Promise<number>;
}

const base: BonusBase[] = [
	{
		key: "double",
		name: "Double Letter",
		desc: "Same letter occurs twice in a row, e.g. gli[mm]er, h[oo]t",
		fn: async (rf: relationFunc, level: number, word: Letter[]): Promise<number> => {
			let n = 0;
			let bc = '';
			for (const c of word) {
				if (c.char === bc) {
					n += level*2;
				}
				bc = c.char
			}
			return n;
		}
	},
	{
		key: "thth",
		name: "No Lisp",
		desc: "Word contains the sequence [th]",
		fn: async (rf: relationFunc, level: number, word: Letter[]): Promise<number> => {
			let n = 0;
			let bc = '';
			for (const c of word) {
				if (bc === 't' && c.char === 'h') {
					n += level*2;
				}
				bc = c.char
			}
			return n;
		}
	},
	{
		key: "short",
		name: "Short and Sweet",
		desc: "Word length is less than 4",
		fn: async (rf: relationFunc, level: number, word: Letter[]): Promise<number> => {
			return word.length < 4 ? level * 2 : 0
		}
	},
	{
		key: "long",
		name: "Lettermaxing",
		desc: "Word length is greater than 4",
		fn: async (rf: relationFunc, level: number, word: Letter[]): Promise<number> => {
			return word.length > 4 ? level * 2 : 0
		}
	},
	{
		key: "numbers",
		name: "Numbers Rock!",
		desc: "Word is a number e.g. fifty",
		fn: async (rf: relationFunc, level: number, word: Letter[]): Promise<number> => {
			const related = await rf('hypernym', 'number', lettersToString(word))
			return related ? level * 3 : 0
		}
	}
];

export const BonusCards = new Map(base.map((bonus) => [bonus.key, {
	key: bonus.key,
	name: bonus.name,
	desc: bonus.desc,
	level: 1
}]))

export const BonusImpls = new Map(base.map((bonus) => [bonus.key, { fn: bonus.fn }]))

