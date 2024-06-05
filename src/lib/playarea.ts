//playarea
// Simple abstraction for the basest component of a letter-based game
// The player's
// - bag of letters
// - letters on hand
// - letters placed for play
// There was also discarded letters previously but I've left that off now
// Letters just get recycled into the letter bag

import type { Letter } from "./letter";
import { LetterScore, isPerm } from "./letter";

import type { PRNG } from "./util";
import { Shuffle } from "./util";

//TODO: LetterStack
export type LetterSlot = Letter | undefined;

export function letterSlotsToString(slots: LetterSlot[]): string {
  let chars = [];
  for (const slot of slots) {
    if (slot) {
      chars.push(slot.char);
    }
  }
  return chars.join("").toLowerCase();
}

// hand field should be addressed, why complicate it?
// Really each array element is a slot that can be empty or have a letter
// To simulate gaps in the hand when placing a letter
// Nicer than having the hand jiggling every time a letter is removed too
export interface PlayArea {
  handSize: number;
  prng: PRNG;

  placed: Letter[];
  hand: LetterSlot[];
  bag: Letter[];
}

export function DiscardPlaced(g: PlayArea): PlayArea {
  return {
    ...g,
    hand: g.hand.filter((letter) => letter !== undefined),
    bag: g.bag.concat(g.placed).filter(isPerm),
    placed: [],
  };
}

// Throw away all letters held in hand and placed
export function DiscardAll(g: PlayArea): PlayArea {
  return {
    ...g,
    bag: g.bag.concat(HandLetters(g.hand)).concat(g.placed).filter(isPerm),
    placed: [],
    hand: [],
  };
}

// Draw enough to fill up hand, keeping existing hand
export function Draw(g: PlayArea): PlayArea {
  const num = g.handSize - g.hand.length;
  if (num < 1) {
    return g;
  }

  return DrawN(g, num);
}

export function NewHand(g: PlayArea): PlayArea {
  return Draw(DiscardAll(g));
}

export function DrawN(g: PlayArea, n: number): PlayArea {
  const shaken = Shuffle(g.prng, g.bag.filter(isPerm));
  return {
    ...g,
    hand: g.hand.concat(shaken.slice(0, n)),
    bag: shaken.slice(n),
  };
}

// Draw a specific id out of the bag
export function DrawById(g: PlayArea, id: string): PlayArea {
  const idx = g.bag.findIndex((x) => x.id === id);
  if (idx < 0) {
    return g;
  }

  return DrawByIndex(g, idx);
}

export function DrawByIndex(g: PlayArea, idx: number): PlayArea {
  return {
    ...g,
    hand: g.hand.concat([g.bag[idx]]),
    bag: g.bag
      .slice(0, idx)
      .concat(g.bag.slice(idx + 1))
      .filter(isPerm),
  };
}

function SlotIn(hand: LetterSlot[], letters: Letter[]): LetterSlot[] {
  let li = 0;
  let xs: LetterSlot[] = [];
  for (const letter of hand) {
    if (letter !== undefined) {
      xs.push(letter);
      continue;
    }

    if (li < letters.length) {
      xs.push(letters[li]);
      li += 1;
      continue;
    }

    xs.push(letter);
  }

  for (let i = li; i < letters.length; i++) {
    xs.push(letters[i]);
  }

  return xs;
}

function HandLetters(hand: LetterSlot[]): Letter[] {
  let xs: Letter[] = [];
  for (const letter of hand) {
    if (!letter) {
      continue;
    }
    xs.push(letter);
  }
  return xs;
}

// Remove letter with id=${id} from placed letters
export function UnplaceById(g: PlayArea, id: string): PlayArea {
  const pi = g.placed.findIndex((letter) => letter.id === id);

  return {
    ...g,
    placed: g.placed.slice(0, pi).concat(g.placed.slice(pi + 1)),
    hand: SlotIn(g.hand, [g.placed[pi]]),
  };
}

export function UnplaceLast(g: PlayArea): PlayArea {
  if (g.placed.length === 0) {
    return g;
  }

  const li = g.placed.length - 1;

  return {
    ...g,
    hand: SlotIn(g.hand, [g.placed[li]]),
    placed: g.placed.slice(0, li),
  };
}

export function UnplaceAll(g: PlayArea): PlayArea {
  if (g.placed.length === 0) {
    return g;
  }

  return {
    ...g,
    placed: [],
    hand: SlotIn(g.hand, g.placed),
  };
}

export function SortHand(g: PlayArea): PlayArea {
  return {
    ...g,
    hand: g.hand.toSorted(),
  };
}

export function PlaceByChar(g: PlayArea, c: string): PlayArea {
  const matches = HandLetters(g.hand)
    .filter((letter) => letter.char === c.toUpperCase())
    .sort((a, b) => LetterScore(a) - LetterScore(b));
  if (matches.length === 0) {
    return g;
  }

  return PlaceById(g, matches[matches.length - 1].id);
}

export function PlaceWord(g: PlayArea, word: string): PlayArea {
  let res = g;
  for (const c of word) {
    res = PlaceByChar(res, c);
  }
  return res;
}

export function PlaceById(g: PlayArea, id: string): PlayArea {
  const idx = g.hand.findIndex((letter) => letter && letter.id === id);
  if (idx === -1) {
    return g;
  }

  const letter = g.hand[idx] as Letter;

  let nextHand = [...g.hand];
  nextHand[idx] = undefined;

  return {
    ...g,
    placed: g.placed.concat([letter]),
    hand: nextHand,
  };
}

export function usableLetters(g: PlayArea): Letter[] {
  let res = [...g.placed];
  for (const letter of g.hand) {
    if (letter) {
      res.push(letter);
    }
  }
  return res;
}
