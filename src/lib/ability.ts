import { 
	Letter,
} from './letter';

import {
	PlayArea,
	DiscardPlaced,
	DrawByIndex,
	Draw
} from './playarea';

export interface AbilityCard {
	key: string
	name: string
	desc: string
	uses: number 
	ok: boolean
}

export interface AbilityImpl {
	pred: (pr: PlayArea) => boolean;
	func: (pr: PlayArea) => void;
}

interface AbilityBase {
	key: string
	name: string
	desc: string
	pred: (pr: PlayArea) => boolean;
	func: (pr: PlayArea) => void;
}

const AbilitiesBase: AbilityBase[] = [
	{
		key: 'drawvowel',
		name: "Vowel Me",
		desc: "Conjure up one of every vowel",
		pred: (pr: PlayArea): boolean => {
			return true
		},
		func: (pr: PlayArea): void => {
			for (const c of 'AEIOU') {
				pr.hand.push({
					id: `vowel-magic-${c}`,
					char: c,
					score: 1,
					level: 2,
					available: true
				})
			}
		}
	},

	{
		key: 'dump',
		name: "Dump",
		desc: "Discard placed letters, draw new letters",
		pred: (pr: PlayArea): boolean => {
			return pr.placed.length > 0;
		},
		func: (pr: PlayArea): void => {
			if (pr.placed.length === 0) {
				return
			}

			DiscardPlaced(pr)
			Draw(pr)
		}
	},

	{
		key: 'clone',
		name: "Clone",
		desc: "Turn placed letters in clone of leftmost placed letter",
		pred: (pr: PlayArea): boolean => {
			return pr.placed.length > 1;
		},
		func: (pr: PlayArea): void => {
			if (pr.placed.length < 2) {
				return
			}

			const len = pr.placed.length;
			let clones: Letter[] = []
			for (const letter of pr.placed.slice(1)) {
				const clone = Object.assign({}, pr.placed[0])
				clone.id = `${letter.id}-clone-of-${pr.placed[0].id}`
				clones.push(clone)
			}

			pr.hand = pr.hand.filter((left) => 
				!pr.placed.slice(1).some((right) => 
					left.id === right.id
				)
			)
			pr.bag = pr.bag.concat(pr.placed.slice(1))
			pr.placed = pr.placed.slice(0, 1).concat(clones)
			pr.hand = pr.hand.concat(clones)
		}
	}
]

export const AbilityCards = new Map(AbilitiesBase.map((x) => [
	x.key, {
		key: x.key,
		name: x.name,
		desc: x.desc,
		uses: 1,
		ok: false
	}
]))

export const AbilityImpls = new Map(AbilitiesBase.map((x) => [
	x.key, { 
		pred: x.pred, 
		func: x.func 
	}
]))

