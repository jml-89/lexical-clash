'use client';

// The main structure, and most all function calls, used in the game
// It's a doozy, all the architectural failings are hacked around in this file
//
// The biggest misread in developing this was how to structure client/server calls
// Due to the database being on server, there are times where the server needs to be called
// This can be done with asynchronous functions, but they have to be provided by server components
// And attaching them to an object caused some issues, function proxying I think?
// Then there's the React State, that's the one I've puzzled over how best to use
// Again it comes down to some object changes being simple and synchronous
// but others are unpredictable asynchronous operations, like grabbing words for a word bank
// Don't want to freeze while waiting for that to complete, right?
// So there's an early state set for the synchronous operation, and a later state set for the async operation
// Oh and multiple sync operations can happen while async chugs along...
// It's really not that difficult with the right structure
// But a real pain with the wrong structure

import { 
	Letter, 
	lettersToString,
	stringToLetters,
	ScrabbleDistribution
} from './letter';

import { Opponent, Opponents, FillWordbank, PlayerProfile } from './opponent';

import prand from 'pure-rand'

import {
	Battle,
	NextWord,

	NewBattle,
	Submit,
	Place,
	Backspace,
	Wipe
} from './battle';

import { BonusCard, BonusCards} from './bonus';
import { AbilityCard, AbilityCards } from './ability';
import { ScoreWord } from './score'

import { 
	KnowledgeBase, 
	ScoredWord,

	Shuffle, 
	ShuffleMap, 
	MapConcat, 
	CopyMap 
} from './util'

import {
	Preamble,
	PreambleSetup,
	NewPreamble
} from './preamble'

// Initially thought TS had ADTs & pattern matching on them
// But appears to be closer to C-style union types
// Still a nice modeling exercise
export type Phase 
	= Preamble
	| Battle 
	| Outcome

// This becomes relevant a little later, see the DoPhase function
type BattleFn = (x: Battle) => void
type OutcomeFn = (x: Outcome) => void
type PreambleFn = (x: Preamble) => void
export type PhaseFn 
	= PreambleFn 
	| BattleFn
	| OutcomeFn

export interface Outcome {
	type: 'outcome'
	done: boolean
	victory: boolean

	opponent: Opponent
	letterUpgrades: number
}

// This is the primary data structure used throughout the entire game
// Nothing higher than this in the tree
//
// Phase system
// The game is divided into three phases
// - Preamble, pick opponent, ability, bonus, wordbank
// - Battle, battle
// - Outcome, battle rewards
// Each of these phases is a different type
// They can modify themselves but the can't turn into other phases themselves
// So they have to signal that they're done, then get turned to the next phase
// Not super clean
export interface GameState {
	sessionid: string

	prng: prand.RandomGenerator
	seed: number
	iter: number

	kb: KnowledgeBase

	phase: Phase;

	level: number

	handSize: number;
	letters: Letter[]; 

	postgame: boolean

	banked: Map<string, boolean>
	wordbank: Map<string, ScoredWord>

	opponents: Map<string, Opponent>
	abilities: Map<string, AbilityCard>
	bonuses: Map<string, BonusCard>
}

function Upgrade(g: GameState, n: number): void {
	if (g.phase.type !== 'outcome') {
		return
	}

	if (n > 0) {
		let indices: number[] = []
		for (let i = 0; i < g.letters.length; i++) {
			indices[i] = i
		}

		Shuffle(g, indices)
		.filter((idx) => g.letters[idx].level < 4)
		.slice(0, n)
		.forEach((idx) => {
			g.letters[idx].score += 1
			g.letters[idx].level += 1
		})
	}

	g.handSize += 2
	g.level += 1

	if (g.phase.opponent.isboss) {
		g.postgame = true
	}
}

export function EndOutcome(o: Outcome): void {
	o.done = true
}

export async function OutcomeToPreamble(g: GameState): Promise<void> {
	if (g.phase.type !== 'outcome') {
		return
	}
	if (g.phase.victory) {
		Upgrade(g, g.phase.letterUpgrades)
	}

	if (g.postgame) {
		for (let [k,o] of g.opponents) {
			o.level = g.level
		}
	}
	g.phase = await NewPreamble(g);
}

export async function LaunchBattle(g: GameState, kb: KnowledgeBase): Promise<void> {
	if (g.phase.type !== 'preamble') {
		return
	}


	for (const k of [g.phase.ability.choice]) {
		if (g.abilities.has(k)) {
			(g.abilities.get(k) as AbilityCard).uses += 1
		} else {
			g.abilities.set(k, AbilityCards.get(k) as AbilityCard)
		}
	}

	for (const k of [g.phase.bonus.choice]) {
		if (g.bonuses.has(k)) {
			(g.bonuses.get(k) as BonusCard).level += 1
		} else {
			g.bonuses.set(k, BonusCards.get(k) as BonusCard)
		}
	}

	const opponent = Opponents.get(g.phase.opponent.choice)
	if (opponent === undefined) {
		console.log(`Could not find opponent: ${g.phase.opponent.choice}`)
		return
	}

	if (g.postgame) {
		opponent.level = g.level
	}
	await FillWordbank(kb.hypos, opponent)
	opponent.wordbank = ShuffleMap(g, opponent.wordbank)

	g.phase = await NewBattle({
		handSize: g.handSize, 
		kb: g.kb,
		bonuses: g.bonuses,
		abilities: g.abilities,
		opponent: opponent,
		letters: Shuffle(g, g.letters),
		wordbank: g.wordbank
	});
}

export function LoadGame(o: Object, kb: KnowledgeBase): GameState {
	const tupmap = (o: Object): Object => {
		for (const [field, value] of Object.entries(o)) {
			if (field === 'maptuples') {
				return new Map<any, any>(value)
			}
		}

		const isObj = (v: any): boolean => 
			v instanceof Object 
			&& !(v instanceof Array) 

		return Object.fromEntries(Object.entries(o).map(
			([field, value]) => [field, 
				field === 'prng' ? prand.xoroshiro128plus(1337) 
				: field === 'kb' ? kb
				: isObj(value) ? tupmap(value) 
				: value
			]
		))
	}

	let ox = tupmap(o) as GameState

	ox.prng = prand.xoroshiro128plus(ox.seed)
	for (let i = 0; i < ox.iter; i++) {
		const [j, n] = prand.uniformIntDistribution(0, i, ox.prng)
		ox.prng = n
	}

	return ox
}

export function NewGame(sessionid: string, seed: number, kb: KnowledgeBase): GameState {
	return {
		kb: kb,
		prng: prand.xoroshiro128plus(seed),
		iter: 0,
		level: 0,
		opponents: CopyMap(Opponents),
		sessionid: sessionid,
		seed: seed,
		handSize: 9,
		postgame: false,
		abilities: new Map<string, AbilityCard>(),
		bonuses: new Map<string, BonusCard>(),
		phase: {
			type: 'outcome',
			done: false,
			victory: true,
			opponent: PlayerProfile,
			letterUpgrades: 10
		},
		letters: ScrabbleDistribution(),
		banked: new Map<string, boolean>,
		wordbank: new Map<string, ScoredWord>,
	}
}

// The inevitable "sharp end" of the type union
// Has to happen because no other way to know that e.g. battle phase only sends battlefns
// Still awkward and more of an indictment on my structure than I'd like to admit
async function DoPhase(g: GameState, phasefn: PhaseFn): Promise<GameState> {
	const ng = Object.assign({}, g)

	if (ng.phase.type === 'battle') {
		await (<BattleFn>phasefn)(ng.phase)
	} else if (ng.phase.type === 'preamble') {
		await (<PreambleFn>phasefn)(ng.phase)
	} else if (ng.phase.type === 'outcome') {
		await (<OutcomeFn>phasefn)(ng.phase)
	}

	return ng
}

async function FillPlayerBank(
	g: GameState, 
	lookup: (s: string) => Promise<ScoredWord[]>, 
	s: string
): Promise<void> {
	let xs = []
	for (const word of await lookup(s)) {
		if (!g.wordbank.has(word.word)) {
			g.wordbank.set(word.word, word)
		}
	}
}

export async function Finalise(
	g: GameState, 
	setfn: (g: GameState) => void,
	phase: Phase
): Promise<void> {
	if (!phase.done) {
		return
	}

	const ng = Object.assign({}, g)

	if (phase.type === 'preamble') {
		await FillPlayerBank(ng, ng.kb.hypos, phase.word.choice)
		await LaunchBattle(ng, ng.kb)
		setfn(ng)
	} else if (phase.type === 'battle') {
		MapConcat(ng.wordbank, phase.player.wordbank)
		if (phase.victory) {
			MapConcat(ng.wordbank, phase.opponent.wordbank)
		}
		ng.phase = { 
			type: 'outcome', 
			done: false,
			victory: phase.victory,
			opponent: phase.opponent,
			letterUpgrades: phase.victory ? phase.opponent.level * 5  : 0
		}
		setfn(ng)

		function maptup(k: any, v: any) {
			return (v instanceof Map) ? {
				maptuples: [...v]
			} : v
		}
		const s = JSON.stringify(ng, maptup)
		await ng.kb.save(ng.sessionid, s)
	} else if (phase.type === 'outcome') {
		await OutcomeToPreamble(ng)
		setfn(ng)
	}
}

