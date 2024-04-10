import { Letter, stringToLetters, simpleScore } from './letter'

export interface Opponent {
	key: string;
	name: string;
	desc: string;
	level: number;
	healthMax: number;
	weaknesses: string[];
	strengths: string[];
	words: string[];
	image: string
}

export const PlayerProfile = {
	key: "player",
	name: "Player",
	desc: "Gamer Neckus",
	level: 1,
	healthMax: 10,
	weaknesses: [],
	strengths: [],
	words: [],
	image: "portrait/dark/frog.jpg"
}

export async function PickWord(lookup: (s: string) => Promise<string[]>, o: Opponent): Promise<Letter[]> {
	return (await lookup(o.words[0]))
		.map((s) => stringToLetters(o.name, s))
		.sort((a, b) => simpleScore(a) - simpleScore(b))[0]
}

export const Opponents = new Map([
	["dog", {
		key: "dog",
		name: "Dog",
		desc: "Canis Familiaris",
		level: 1,
		healthMax: 10,
		weaknesses: ['food'],
		strengths: ['toy'],
		words: ['toy'],
		image: "portrait/dark/dog.jpg"
	}],
	["cat", {
		key: "cat",
		name: "Cat",
		desc: "Felinus Scratchus",
		level: 1,
		healthMax: 10,
		weaknesses: ['flora', 'water'],
		strengths: ['fauna'],
		words: ['fauna'],
		image: "portrait/dark/cat.jpg"
	}],
	["philosopher", {
		key: "philosopher",
		name: "Philosopher",
		desc: "Nerdus Wordus",
		level: 2,
		healthMax: 10,
		weaknesses: ['color'],
		strengths: ['time'],
		words: ['time'],
		image: "portrait/dark/philo.jpg"
	}],
	['vampire', {
		key: 'vampire',
		name: 'Vampire',
		desc: 'Ah ah ah!',
		level: 2,
		healthMax: 10,
		weaknesses: ['morality', 'water', 'belief', 'light'],
		strengths: ['darkness', 'misconduct'],
		words: ['misconduct'],
		image: 'portrait/dark/vamp.jpg'
	}]
])

