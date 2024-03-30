import { randn } from './util.ts';

// Representation of a scrabble-like tile
// One may consider whether this is worthwhile to use
// When just a string and looking up scores is quite easy
// I think in the long run, Letter may be expanded further
type Letter = {
	id: number;
	char: string;
	score: number;
	available: boolean;
}

const scrabbleMaterial = [
	{letter: 'A', score: 1, count: 9},
	{letter: 'E', score: 1, count: 12},
	{letter: 'I', score: 1, count: 9},
	{letter: 'O', score: 1, count: 8},
	{letter: 'U', score: 1, count: 4},

	{letter: 'L', score: 1, count: 4},
	{letter: 'N', score: 1, count: 6},
	{letter: 'S', score: 1, count: 4},
	{letter: 'T', score: 1, count: 6},
	{letter: 'R', score: 1, count: 6},

	{letter: 'D', score: 2, count: 4},
	{letter: 'G', score: 2, count: 3},

	{letter: 'B', score: 3, count: 2},
	{letter: 'C', score: 3, count: 2},
	{letter: 'M', score: 3, count: 2},
	{letter: 'P', score: 3, count: 2},

	{letter: 'F', score: 4, count: 2},
	{letter: 'H', score: 4, count: 2},
	{letter: 'V', score: 4, count: 2},
	{letter: 'W', score: 4, count: 2},
	{letter: 'Y', score: 4, count: 2},

	{letter: 'K', score: 5, count: 1},

	{letter: 'J', score: 8, count: 1},
	{letter: 'X', score: 8, count: 1},

	{letter: 'Q', score: 10, count: 1},
	{letter: 'Z', score: 10, count: 1}
];


export function ScrabbleDistribution(): Array<Letter> {
	let xs = scrabbleMaterial.flatMap((tile) => {
		let ys = new Array(tile.count);
		for (let i = 0; i < tile.count; i++) {
			ys[i] = { 
				id: -1,
				char: tile.letter,
				score: tile.score,
				available: true
			};
		}
		return ys;
	}).map((letter, idx) => { 
		letter.id = `scrabble-${idx}`;
		return letter;
	});

	// Shuffle
	let ys = new Array(xs.length);
	for (const [i, x] of xs.entries()) {
		const j = randn(i+1);
		if (j !== i) {
			ys[i] = ys[j];
		}
		ys[j] = x;
	}

	return ys;
}

export function stringToLetters(pref: string, word: string): Array<Letter> {
	let xs = new Array(word.length);
	let i = 0;
	for (const c of word.toUpperCase()) {
		let idx = scrabbleMaterial.findIndex((s) => s.letter === c);
		if (idx === -1) {
			continue;
		}

		let mat = scrabbleMaterial[idx];
		xs.push({ 
			id: i,
			char: mat.letter,
			score: mat.score,
			available: true
		});
		i++;
	}
	return xs;
}

export function lettersToString(letters: Array<Letter>): string {
	return letters.map((letter) => letter.char).join('');
}

