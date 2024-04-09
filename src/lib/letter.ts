// Representation of a scrabble-like tile with some extra bits
// id of a letter needs to be unique amongst other letters in bag/hand/placed
export interface Letter {
	id: string
	char: string
	score: number
	level: number
	available: boolean
}

// Hastily borrowed from Wikipedia
// No blank tiles included -- maybe worth trying
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

// Returns an UNSORTED distribution of letters based on Scrabble letter counts
// Caller is expected to shuffle
export function ScrabbleDistribution(): Letter[] { 
	return scrabbleMaterial.flatMap((tile) => {
		let ys = new Array(tile.count);
		for (let i = 0; i < tile.count; i++) {
			ys[i] = { 
				id: '',
				char: tile.letter,
				score: tile.score,
				level: 1,
				available: true
			};
		}
		return ys;
	}).map((letter, idx) => { 
		letter.id = `scrabble-${idx}`;
		return letter;
	});
}

// Returns word transformed into Letter array
// pref: prefix for the id of the letter
// word: Word to turn into an array of letters
export function stringToLetters(pref: string, word: string): Letter[] {
	let xs: Letter[] = []
	let i = 0;
	for (const c of word.toUpperCase()) {
		let idx = scrabbleMaterial.findIndex((s) => s.letter === c);
		if (idx === -1) {
			continue;
		}

		let mat = scrabbleMaterial[idx];
		xs.push({ 
			id: `${pref}-${word}-${i}`,
			char: mat.letter,
			score: mat.score,
			level: 1,
			available: true
		});
		i++;
	}
	return xs;
}

export function lettersToString(letters: Letter[]): string {
	return letters.map((letter) => letter.char).join('');
}

