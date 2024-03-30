"use server"

import { open } from 'node:fs/promises';

const pathWords = "/usr/share/dict/words";

let dict = new Map();
let solutions = new Map();

export async function FindSolutions(letters: string): Array<string> {
	await Init();

	//console.log(`FindSolutions(${letters})`);

	const chars = alphabetise(letters);
	const perms = permutations(chars);

	const xs = [];
	for (const perm of perms) {
		if (!solutions.has(perm)) {
			continue;
		}

		for (const soln of solutions.get(perm)) {
			xs.push(soln);
		}
	}

	return xs;
}

export async function CheckWord(word: string): boolean {
	return true;
	//await Init();
	//return dict.has(word);
}


async function Init() {
	if (dict.size !== 0) {
		return;
	}

	const fi = await open(pathWords);
	for await (const line of fi.readLines()) {
		if (line.indexOf("'") !== -1) {
			continue;
		}

		const word = line.trim().toUpperCase();

		dict.set(word, true);

		const jumbled = alphabetise(word);
		if (solutions.has(jumbled)) {
			solutions.get(jumbled).push(word);
		} else {
			solutions.set(jumbled, [word]);
		}
	}
}

function permutations(word: string): Array<string> {
	let m = new Map();
	m.set(word, true);
	function util(pre: string, res: string) {
		if (res.length === 0) {
			return;
		}

		const h = res.slice(0, 1);
		const t = res.slice(1);

		m.set(pre + t, true);

		util(pre + h, t);
		util(pre, t);
	}

	util("", word);

	let xs = [];
	for (const [k, v] of m) {
		xs.push(k);
	}
	return xs;
}


function alphabetise(word: string): string {
	let xs = Array(word.length);

	for (const c of word) {
		xs.push(c);
	}
	xs.sort();

	return xs.join('');
}


