import { Letter, stringToLetters, simpleScore } from './letter'

export interface Opponent {
	key: string;
	name: string;
	desc: string;
	level: number;
	healthMax: number;
	weakness: string[];
	strength: string[];
	wordbank: Letter[][]
	image: string
}

export const PlayerProfile = {
	key: "player",
	name: "Player",
	desc: "Gamer Neckus",
	level: 1,
	healthMax: 10,
	weakness: [],
	strength: [],
	wordbank: [],
	image: "portrait/dark/frog.jpg"
}

export async function FillWordbank(lookup: (s: string) => Promise<string[]>, o: Opponent): Promise<void> {
	let xs = []
	for (const s of o.strength) {
		for (const word of await lookup(s)) {
			xs.push(stringToLetters(o.name, word))
		}
	}

	const minScore = 10 * (o.level-1)
	const maxScore = 10 * o.level
	xs = xs.filter((a) => {
		const n = simpleScore(a)
		return (minScore <= n) && (n <= maxScore)
	})
	xs.sort((a, b) => simpleScore(a) - simpleScore(b))
	o.wordbank = xs
}

export const Opponents = new Map([
	["dog", {
		key: "dog",
		name: "Dog",
		desc: "Canis Familiaris",
		level: 1,
		healthMax: 10,
		weakness: ['food'],
		strength: ['food'],
		wordbank: [],
		image: "portrait/dark/dog.jpg"
	}],
	["cat", {
		key: "cat",
		name: "Cat",
		desc: "Felinus Scratchus",
		level: 1,
		healthMax: 10,
		weakness: ['flora'],
		strength: ['fauna'],
		wordbank: [],
		image: "portrait/dark/cat.jpg"
	}],
	["philosopher", {
		key: "philosopher",
		name: "Philosopher",
		desc: "Nerdus Wordus",
		level: 2,
		healthMax: 10,
		weakness: ['color'],
		strength: ['time'],
		wordbank: [],
		image: "portrait/dark/philo.jpg"
	}],
	['vampire', {
		key: 'vampire',
		name: 'Vampire',
		desc: 'Ah ah ah!',
		level: 2,
		healthMax: 10,
		weakness: ['mineral'],
		strength: ['misconduct'],
		wordbank: [],
		image: 'portrait/dark/vamp.jpg'
	}],
	['robot', {
		key: 'robot',
		name: 'Automaton',
		desc: 'Beepus Boopus',
		level: 3,
		healthMax: 10,
		weakness: ['water'],
		strength: ['machine'],
		wordbank: [],
		image: 'portrait/dark/robot.jpg'
	}],
	['fish', {
		key: 'fish',
		name: 'Fish',
		desc: 'Splishus Splashus',
		level: 1,
		healthMax: 10,
		weakness: ['tool'],
		strength: ['malacopterygian'],
		wordbank: [],
		image: 'portrait/dark/fish.jpg'
	}],
	['octopus', {
		key: 'octopus',
		name: 'Octopus',
		desc: 'Extra-Terrestrial',
		level: 3,
		healthMax: 10,
		weakness: ['weather'],
		strength: ['number'],
		wordbank: [],
		image: 'portrait/dark/octopus.jpg'
	}]
])

