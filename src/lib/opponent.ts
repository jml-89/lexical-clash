import { Letter, stringToLetters, lettersToString, simpleScore } from './letter'

export interface Opponent {
	key: string;
	name: string;
	desc: string;
	level: number;
	healthMax: number;
	weakness: string[];
	strength: string[];
	wordbank: Map<string, Letter[]>
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
	wordbank: new Map<string, Letter[]>(),
	image: "portrait/dark/frog.jpg"
}

export async function FillWordbank(lookup: (s: string) => Promise<string[]>, o: Opponent): Promise<void> {
	let xs = []
	for (const s of o.strength) {
		for (const word of await lookup(s)) {
			xs.push(stringToLetters(o.name, word))
		}
	}

	const scoreInRange = (xs: Letter[]): boolean => {
		const xn = simpleScore(xs)
		return (minScore <= xn) && (xn <= maxScore)
	}

	//const step = 5 * (o.level-1)
	const minScore = 3 * o.level
	const maxScore = 7 * o.level

	let ys = xs.filter((a) => {
		const n = simpleScore(a)
		return (minScore <= n) && (n <= maxScore)
	})

	if (ys.length < 10) {
		ys = xs
	}

	ys.sort((a, b) => simpleScore(a) - simpleScore(b))

	for (const y of ys) {
		o.wordbank.set(lettersToString(y), y)
	}
}

export const Opponents: Map<string, Opponent> = new Map([
	{
		key: "dog",
		name: "Dog",
		desc: "Canis Familiaris",
		level: 1,
		weakness: ['food'],
		strength: ['food'],
		image: "portrait/dark/dog.jpg"
	},
	{
		key: "cat",
		name: "Cat",
		desc: "Felinus Scratchus",
		level: 1,
		weakness: ['flora'],
		strength: ['fauna'],
		image: "portrait/dark/cat.jpg"
	},
	{
		key: "philosopher",
		name: "Philosopher",
		desc: "Nerdus Wordus",
		level: 2,
		weakness: ['color'],
		strength: ['time'],
		image: "portrait/dark/philo.jpg"
	},
	{
		key: 'vampire',
		name: 'Vampire',
		desc: 'Ah ah ah!',
		level: 2,
		weakness: ['mineral'],
		strength: ['misconduct'],
		image: 'portrait/dark/vamp.jpg'
	},
	{
		key: 'robot',
		name: 'Automaton',
		desc: 'Beepus Boopus',
		level: 3,
		weakness: ['water'],
		strength: ['machine'],
		image: 'portrait/dark/robot.jpg'
	},
	{
		key: 'fish',
		name: 'Fish',
		desc: 'Splishus Splashus',
		level: 1,
		weakness: ['tool'],
		strength: ['malacopterygian'],
		image: 'portrait/dark/fish.jpg'
	},
	{
		key: 'octopus',
		name: 'Octopus',
		desc: 'Extra-Terrestrial',
		level: 3,
		weakness: ['weather'],
		strength: ['number'],
		image: 'portrait/dark/octopus.jpg'
	},
	{
		key: 'wombat',
		name: 'Boss Wombat',
		desc: 'The End',
		level: 4,
		weakness: [''],
		strength: ['noesis'],
		image: 'portrait/dark/wombat.jpg'
	}].map((opp) => [opp.key, {
		...opp,
		healthMax: 10,
		wordbank: new Map<string, Letter[]>()
	}]))

