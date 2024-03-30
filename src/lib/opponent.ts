import { Letter, stringToLetters } from './letter.ts'

interface Opponent {
	key: string;
	name: string;
	desc: string;
	healthMax: number;
	weaknesses: string[];
	strengths: string[];
	immunities: string[];
	words: string[];
}

export const Opponents = new Map([
	["dog", {
		key: "dog",
		name: "Dog",
		desc: "Canis Canis",
		healthMax: 10,
		weaknesses: ['food'],
		strengths: [],
		immunities: [],
		words: ["arf", "borf", "woof", "awooooo"]
	}],
	["cat", {
		key: "cat",
		name: "Cat",
		desc: "Felinus Scratchus",
		healthMax: 10,
		weaknesses: ['liquid'],
		strengths: [],
		immunities: [],
		words: ["meow", "blep", "nyan", "mrow"]
	}]
])

