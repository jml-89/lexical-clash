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
	discard: Letter[]
}

export function DiscardPlaced(g: PlayArea): void {
	g.discard = g.discard.concat(g.hand.filter((letter) => isPlaced(g, letter)))
	g.hand = g.hand.filter((letter) => !isPlaced(g, letter))
	g.placed = []
}

// Throw away all letters held in hand
export function DiscardAll(g: PlayArea): void {
	g.placed = []
	g.hand = g.hand.map((letter) => {letter.available = true; return letter})
	g.discard = g.discard.concat(g.hand)
	g.hand = []
}

// Draw enough to fill up hand, keeping existing hand
export function Draw(g: PlayArea): void {
	const num = g.handSize - g.hand.length
	if (num < 1) {
		return
	}

	const more = g.bag.slice(0, num).map(makeAvail)
	g.hand = g.hand.concat(more)
	g.bag = g.bag.slice(num)
}

// Draw a specific id out of the bag
export function DrawById(g: PlayArea, id: string): void {
	const idx = g.bag.findIndex((x) => x.id === id)
	if (idx < 0) {
		return
	}

	DrawByIndex(g, idx)
}

export function DrawByIndex(g: PlayArea, idx: number): void {
	g.hand = g.hand.concat([g.bag[idx]]);
	g.bag = g.bag.slice(0, idx).concat(g.bag.slice(idx+1));
}

// Remove letter with id=${id} from placed letters
export function UnplaceById(g: PlayArea, id: string): void {
	const pi = g.placed.findIndex((letter) => letter.id === id)
	g.placed = g.placed.slice(0, pi).concat(g.placed.slice(pi+1))

	const hi = g.hand.findIndex((letter) => letter.id === id)
	g.hand[hi].available = true;
}

export function UnplaceLast(g: PlayArea): void {
	if (g.placed.length === 0) {
		return
	}

	const li = g.placed.length - 1;
	const idx = g.hand.findIndex((letter) => letter.id === g.placed[li].id);

	g.hand[idx].available = true;
	g.placed = g.placed.slice(0, li);
}

export function UnplaceAll(g: PlayArea): void {
	if (g.placed.length === 0) {
		return
	}

	g.placed = []
	for (const h of g.hand) {
		h.available = true
	}
}

export function PlaceById(g: PlayArea, id: string): void {
	const idx = g.hand.findIndex((letter) => 
		letter.available && letter.id === id
	);
	if (idx === -1) {
		return;
	}

	g.placed = g.placed.concat([g.hand[idx]]);
	g.hand[idx].available = false;
}


function makeAvail(letter: Letter): Letter {
	letter.available = true
	return letter
}

function isPlaced(g: PlayArea, letter: Letter): boolean {
	return g.placed.some((pl) => letter.id === pl.id)
}

