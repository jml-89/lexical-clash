import { Letter, stringToLetters, lettersToString, simpleScore } from './letter'
import { ScoredWord } from './util'

export interface Opponent {
	key: string;
	name: string;
	desc: string;
	isboss: boolean
	level: number;
	healthMax: number;
	weakness: string[];
	strength: string[];
	wordbank: Map<string, ScoredWord>
	image: string
}

export const PlayerProfile = {
	key: "player",
	name: "Player",
	desc: "Gamer Neckus",
	isboss: false,
	level: 1,
	healthMax: 10,
	weakness: [],
	strength: [],
	wordbank: new Map<string, ScoredWord>(),
	image: "portrait/dark/frog.jpg"
}

export async function FillWordbank(lookup: (s: string) => Promise<ScoredWord[]>, o: Opponent): Promise<void> {
	let xs = []
	for (const s of o.strength) {
		for (const word of await lookup(s)) {
			xs.push(word)
		}
	}

	const minScore = 3 + (4 * (o.level-1))
	const maxScore = 8 + (5 * (o.level-1))
	const scoreInRange = (xs: ScoredWord): boolean => {
		return (minScore <= xs.score) && (xs.score <= maxScore)
	}

	let ys = xs.filter(scoreInRange)

	// This happens when the level gets too high
	// This is a signal to just go huge, use best words
	if (ys.length < 10) {
		ys = xs.toSorted(
			(a, b) => b.score - a.score
		).slice(0, 20)
	}

	for (const y of ys) {
		o.wordbank.set(y.word, y)
	}
}

export const Opponents: Map<string, Opponent> = new Map([
	{
		key: "dog",
		name: "Dog",
		desc: "Canis Familiaris",
		level: 1,
		isboss: false,
		weakness: ['food'],
		strength: ['food'],
		image: "portrait/dark/dog.jpg"
	},
	{
		key: "cat",
		name: "Cat",
		desc: "Felinus Scratchus",
		level: 1,
		isboss: false,
		weakness: ['flora'],
		strength: ['fauna'],
		image: "portrait/dark/cat.jpg"
	},
	{
		key: 'fish',
		name: 'Fish',
		desc: 'Splishus Splashus',
		level: 1,
		isboss: false,
		weakness: ['tool'],
		strength: ['malacopterygian'],
		image: 'portrait/dark/fish.jpg'
	},

	{
		key: 'rat',
		name: 'Rat',
		desc: 'Gnawus Allus',
		level: 2,
		isboss: false,
		weakness: ['game'],
		strength: ['body'],
		image: 'portrait/dark/rat.jpg'
	},
	{
		key: 'bee',
		name: 'Bee',
		desc: 'buzz buzz',
		level: 2,
		isboss: false,
		weakness: ['chemical'],
		strength: ['insect'],
		image: 'portrait/dark/bee.jpg'
	},
	{
		key: 'octopus',
		name: 'Octopus',
		desc: 'Extra-Aquatical',
		level: 2,
		isboss: false,
		weakness: ['weather'],
		strength: ['number'],
		image: 'portrait/dark/octopus.jpg'
	},

	{
		key: 'vampire',
		name: 'Vampire',
		desc: 'Ah ah ah!',
		level: 3,
		isboss: false,
		weakness: ['mineral'],
		strength: ['misconduct'],
		image: 'portrait/dark/vamp.jpg'
	},
	{
		key: "philosopher",
		name: "Philosopher",
		desc: "Nerdus Wordus",
		level: 3,
		isboss: false,
		weakness: ['color'],
		strength: ['time'],
		image: "portrait/dark/philo.jpg"
	},
	{
		key: 'robot',
		name: 'Automaton',
		desc: 'Beepus Boopus',
		level: 3,
		isboss: false,
		weakness: ['water'],
		strength: ['machine'],
		image: 'portrait/dark/robot.jpg'
	},

	{
		key: 'kookaburra',
		name: 'Kookaburra',
		desc: 'Laughus Laughus',
		level: 4,
		isboss: false,
		weakness: ['herb'],
		strength: ['bird'],
		image: 'portrait/dark/kookaburra.jpg'
	},
	{
		key: 'cloud',
		name: 'Cloud',
		desc: 'Fluffus Fluffy',
		level: 4,
		isboss: false,
		weakness: ['measure'],
		strength: ['weather'],
		image: 'portrait/dark/cloud.jpg'
	},

	{
		key: 'dinosaur',
		name: 'Tea Rex',
		desc: 'Herbus Sippus',
		level: 5,
		isboss: false,
		weakness: ['kindle'],
		strength: ['herb'],
		image: 'portrait/dark/dinosaur.jpg'
	},
	{
		key: 'train',
		name: 'Locomotive',
		desc: 'Steamus Pistonus',
		level: 5,
		isboss: false,
		weakness: ['nature'],
		strength: ['transport'],
		image: 'portrait/dark/train.jpg'
	},

	{
		key: 'plaguedoctor',
		name: 'Plague Doctor',
		desc: 'One Sick Bird',
		level: 6,
		isboss: false,
		weakness: ['technology'],
		strength: ['disease'],
		image: 'portrait/dark/plaguedoctor.jpg'
	},
	
	{
		key: 'wombat',
		name: 'Boss Wombat',
		desc: 'The End',
		level: 7,
		isboss: true,
		weakness: [''],
		strength: ['noesis'],
		image: 'portrait/dark/wombat.jpg'
	}].map((opp) => [opp.key, {
		...opp,
		healthMax: 10,
		wordbank: new Map<string, ScoredWord>()
	}]))

