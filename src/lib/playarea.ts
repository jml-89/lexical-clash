// Simple abstraction for the basest component of a letter-based game
// The player's bag of letters, letters on hand, discarded letters,
// and letters placed ready to be checked and allowed to be played

import {
	Letter
} from './letter'

export interface PlayArea {
	handSize: number

	placed: Letter[]
	hand: Letter[]
	bag: Letter[]
}

export function DiscardPlaced(g: PlayArea): PlayArea {
        return {
                ...g,
                bag: g.bag.concat(g.hand.filter((letter) => isPlaced(g, letter))),
                hand: g.hand.filter((letter) => !isPlaced(g, letter)),
                placed: []
        }
}

// Throw away all letters held in hand
export function DiscardAll(g: PlayArea): PlayArea {
        return {
                ...g,
                placed: [],
                hand: [],
                bag: g.bag.concat(g.hand)
        }
}

// Draw enough to fill up hand, keeping existing hand
export function Draw(g: PlayArea): PlayArea {
	const num = g.handSize - g.hand.length
	if (num < 1) {
		return g
	}

        return DrawN(g, num)
}

export function DrawN(g: PlayArea, n: number): PlayArea {
        return {
                ...g,
                hand: g.hand.concat(g.bag.slice(0, n)).map(makeAvail),
                bag: g.bag.slice(n)
        }
}

// Draw a specific id out of the bag
export function DrawById(g: PlayArea, id: string): PlayArea {
	const idx = g.bag.findIndex((x) => x.id === id)
	if (idx < 0) {
		return g
	}

	return DrawByIndex(g, idx)
}

export function DrawByIndex(g: PlayArea, idx: number): PlayArea {
        return {
                ...g,
                hand: g.hand.concat([g.bag[idx]]),
                bag: g.bag.slice(0, idx).concat(g.bag.slice(idx+1))
        }
}

// Remove letter with id=${id} from placed letters
export function UnplaceById(g: PlayArea, id: string): PlayArea {
	const pi = g.placed.findIndex((letter) => letter.id === id)
	const hi = g.hand.findIndex((letter) => letter.id === id)

        let nextHand = [ ...g.hand ]
        nextHand[hi] = {
                ...g.hand[hi],
                available: true
        }

        return {
                ...g,
                placed: g.placed.slice(0, pi).concat(g.placed.slice(pi+1)),
                hand: nextHand
        }
}

export function UnplaceLast(g: PlayArea): PlayArea {
	if (g.placed.length === 0) {
		return g
	}

	const li = g.placed.length - 1;
	const idx = g.hand.findIndex((letter) => letter.id === g.placed[li].id);

        let nextHand = [ ...g.hand ]
	nextHand[idx] = {
                ...g.hand[idx],
                available: true
        }

        return {
                ...g,
                hand: nextHand,
                placed: g.placed.slice(0, li)
        }
}

export function UnplaceAll(g: PlayArea): PlayArea {
	if (g.placed.length === 0) {
		return g
	}

        return {
                ...g,
                placed: [],
                hand: g.hand.map(makeAvail)
        }
}

export function PlaceByChar(g: PlayArea, c: string): PlayArea {
	const matches = g.hand
		.filter((letter) => letter.available)
		.filter((letter) => letter.char === c.toUpperCase())
		.sort((a, b) => a.score - b.score)
	if (matches.length === 0) {
		return g
	}

	return PlaceById(g, matches[matches.length-1].id)
}

export function PlaceWord(g: PlayArea, word: string): PlayArea {
        let res = g
	for (const c of word) {
		res = PlaceByChar(res, c)
	}
        return res
}

export function PlaceById(g: PlayArea, id: string): PlayArea {
	const idx = g.hand.findIndex((letter) => 
		letter.available && letter.id === id
	);
	if (idx === -1) {
		return g
	}
	
        let nextHand = [ ...g.hand ]
        nextHand[idx] = { 
                ...nextHand[idx],
                available: false
        }

        return {
                ...g,
                placed: g.placed.concat([g.hand[idx]]),
                hand: nextHand
        }
}

function makeAvail(letter: Letter): Letter {
        if (letter.available) {
                return letter
        }

        return {
                ...letter,
                available: true
        }
}

function isPlaced(g: PlayArea, letter: Letter): boolean {
	return g.placed.some((pl) => letter.id === pl.id)
}

