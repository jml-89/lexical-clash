import { Letter, stringToLetters } from './letter.ts'

interface Opponent {
	key: string;
	name: string;
	desc: string;
	healthMax: number;
	weaknesses: string[];
	strengths: string[];
	words: string[];
	image: string
}

export const Opponents = new Map([
	["dog", {
		key: "dog",
		name: "Dog",
		desc: "Canis Familiaris",
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
		healthMax: 10,
		weaknesses: ['color'],
		strengths: ['time'],
		words: ['phenomenon', 'noumenon', 'synthesis', 'antithesis', 'hypothesis'],
		image: "portrait/dark/philo.jpg"
	}],
	['vampire', {
		key: 'vampire',
		name: 'Nosferatu',
		desc: 'Red Gourmand',
		healthMax: 10,
		weaknesses: ['morality', 'water', 'belief', 'light'],
		strengths: ['darkness', 'misconduct'],
		words: ['blood', 'sanguinity', 'chalice', 'fanged'],
		image: 'portrait/dark/vamp.jpg'
	}]
])

