import { 
	Letter,
} from './letter.ts';

interface AbilityReq {
	placed: Array<Letter>;
	hand: Array<Letter>;
	bag: Array<Letter>;
	discard: Array<Letter>;
}

interface AbilityCard {
	key: string
	name: string
	desc: string
	uses: string
	ok: boolean
}

interface AbilityImpl {
	pred: (pr: AbilityReq) => boolean;
	func: (pr: AbilityReq) => void;
}

interface AbilityBase {
	key: string
	name: string
	desc: string
	pred: (pr: AbilityReq) => boolean;
	func: (pr: AbilityReq) => void;
}

const AbilitiesBase: AbilityBase[] = [
	{
		key: 'drawvowel',
		name: "Vowel Me",
		desc: "Draw a random vowel from your bag of letters",
		pred: (pr: AbilityReq): boolean => {
			return pr.bag.some((letter) => /[AEIOU]/.test(letter.char));
		},
		func: (pr: AbilityReq): void => {
			const idx = pr.bag.findIndex((letter) => /[AEIOU]/.test(letter.char));
			if (idx === -1) {
				return;
			}

			pr.hand = pr.hand.concat([pr.bag[idx]]);
			pr.bag = pr.bag.slice(0,idx).concat(pr.bag.slice(idx+1));
		}
	},

	{
		key: 'dump',
		name: "Dump",
		desc: "Discard placed letters, draw new letters",
		pred: (pr: AbilityReq): boolean => {
			return pr.placed.length > 0;
		},
		func: (pr: AbilityReq): void => {
			if (pr.placed.length === 0) {
				return
			}

			const len = pr.placed.length;
			pr.hand = pr.hand.filter((left) => !pr.placed.some((right) => left.id === right.id));

			pr.discard = pr.discard.concat(pr.placed);
			pr.placed = [];

			pr.hand = pr.hand.concat(pr.bag.slice(0,len));
			pr.bag = pr.bag.slice(len);
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

