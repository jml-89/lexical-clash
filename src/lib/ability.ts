import { 
	Letter,
} from './letter.ts';

import {
	PlayArea,
	DiscardPlaced,
	DrawByIndex,
	Draw
} from './playarea.ts';

interface AbilityCard {
	key: string
	name: string
	desc: string
	uses: string
	ok: boolean
}

interface AbilityImpl {
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
		desc: "Draw a random vowel from your bag of letters",
		pred: (pr: PlayArea): boolean => {
			return pr.bag.some((letter) => /[AEIOU]/.test(letter.char));
		},
		func: (pr: PlayArea): void => {
			const idx = pr.bag.findIndex((letter) => /[AEIOU]/.test(letter.char));
			if (idx === -1) {
				return;
			}

			DrawByIndex(pr, idx)
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
				clones.push({
					id: `${letter.id}-clone-of-${pr.placed[0].id}`,
					char: pr.placed[0].char,
					score: pr.placed[0].score,
					available: false
				})
			}

			pr.hand = pr.hand.filter((left) => 
				!pr.placed.slice(1).some((right) => 
					left.id === right.id
				)
			)
			pr.discard = pr.discard.concat(pr.placed.slice(1))
			pr.placed = pr.placed.slice(0, 1).concat(clones)
			pr.hand = pr.hand.concat(clones)
		}
	}
]

export const AbilityCards = new Map(AbilitiesBase.map((x) => {
	const y = Object.assign({}, x)
	y.uses = 1
	y.ok = false
	delete y.pred
	delete y.func
	return [x.key, y]
}))

export const AbilityImpls = new Map(AbilitiesBase.map((x) => [x.key, { pred: x.pred, func: x.func }]))

