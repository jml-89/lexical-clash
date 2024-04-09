import { Letter, stringToLetters } from './letter'

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

export const Opponents = new Map([
	["dog", {
		key: "dog",
		name: "Dog",
		desc: "Canis Familiaris",
		level: 1,
		healthMax: 10,
		weaknesses: ['food'],
		strengths: ['toy'],
		words: ["arf", "borf", "woof", "awooooo"],
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
		words: ["meow", "blep", "nyan", "mrow"],
		image: "portrait/dark/cat.jpg"
	}],
	["philosopher", {
		key: "philosopher",
		name: "The Philosopher",
		desc: "Nerdus Wordus",
		level: 2,
		healthMax: 10,
		weaknesses: ['color'],
		strengths: ['time'],
		words: ['phenomenon', 'noumenon', 'synthesis', 'antithesis', 'hypothesis'],
		image: "portrait/dark/philo.jpg"
	}],
	['vampire', {
		key: 'vampire',
		name: 'Nosferatu',
		desc: 'The Gourmand',
		level: 2,
		healthMax: 10,
		weaknesses: ['morality', 'water', 'belief', 'light'],
		strengths: ['darkness', 'misconduct'],
		words: ['blood', 'sanguinity', 'chalice', 'fanged'],
		image: 'portrait/dark/vamp.jpg'
	}]
])

