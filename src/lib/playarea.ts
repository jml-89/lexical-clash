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

export type LetterStack = Letter[];

export interface PlayArea {
  handSize: number;
  prng: PRNG;

  placed: Letter[];
  hand: LetterStack[];

  bag: Letter[];
}

export function NewPlayArea(
  prng: PRNG,
  handSize: number,
  bag: Letter[],
): PlayArea {
  return {
    handSize: handSize,
    prng: prng,
    bag: bag,
    placed: [],
    hand: [],
  };
}

export function PackUp(g: PlayArea): PlayArea {
  return {
    ...g,
    hand: [],
    placed: [],
    bag: [...g.bag, ...handLetters(g.hand), ...g.placed],
  };
}

export function LiquidatePlaced(g: PlayArea): PlayArea {
  return {
    ...g,
    hand: g.hand.filter((stack) => stack.length > 0),
    placed: [],
  };
}

export function DiscardPlaced(g: PlayArea): PlayArea {
  return {
    ...g,
    hand: g.hand.filter((stack) => stack.length > 0),
    bag: g.bag.concat(g.placed).filter(isPerm),
    placed: [],
  };
}

// Throw away all letters held in hand and placed
export function DiscardAll(g: PlayArea): PlayArea {
  return {
    ...g,
    bag: g.bag.concat(handLetters(g.hand)).concat(g.placed).filter(isPerm),
    placed: [],
    hand: [],
  };
}

export function DrawAll(g: PlayArea): PlayArea {
  return DrawN(g, g.bag.length);
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
    hand: sortStacks(stackIn(g.hand, shaken.slice(0, n))),
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
    hand: stackIn(g.hand, [g.bag[idx]]),
    bag: g.bag
      .slice(0, idx)
      .concat(g.bag.slice(idx + 1))
      .filter(isPerm),
  };
}

function sortStacks(stacks: LetterStack[]): LetterStack[] {
  const xs = [...stacks];
  xs.sort((a: LetterStack, b: LetterStack) => a.length - b.length);
  //(a.length === 0 ? 0 : a[0].base) - (b.length === 0 ? 0 : b[0].base)
  return xs;
}

export function AddToHand(g: PlayArea, letters: Letter[]): PlayArea {
  return {
    ...g,
    hand: stackIn(g.hand, letters),
  };
}

function stackIn(hand: LetterStack[], letters: Letter[]): LetterStack[] {
  let xs: LetterStack[] = [...hand];
  for (const letter of letters) {
    let idx = xs.findIndex(
      (stack) => stack.length > 0 && stack[0].char === letter.char,
    );
    if (idx >= 0) {
      xs[idx].push(letter);
      continue;
    }

    idx = xs.findIndex((stack) => stack.length === 0);
    if (idx >= 0) {
      xs[idx].push(letter);
      continue;
    }

    xs.push([letter]);
  }

  xs.forEach((stack: LetterStack) =>
    stack.sort((a: Letter, b: Letter) => b.bonus - a.bonus),
  );
  return xs;
}

export function LettersInPlay(g: PlayArea): Letter[] {
  return [...g.placed, ...handLetters(g.hand)];
}

function handLetters(hand: LetterStack[]): Letter[] {
  let xs: Letter[] = [];
  for (const stack of hand) {
    for (const letter of stack) {
      xs.push(letter);
    }
  }
  return xs;
}

// Remove letter with id=${id} from placed letters
export function UnplaceById(g: PlayArea, id: string): PlayArea {
  const pi = g.placed.findIndex((letter) => letter.id === id);

  return {
    ...g,
    placed: g.placed.slice(0, pi).concat(g.placed.slice(pi + 1)),
    hand: stackIn(g.hand, [g.placed[pi]]),
  };
}

export function UnplaceLast(g: PlayArea): PlayArea {
  if (g.placed.length === 0) {
    return g;
  }

  const li = g.placed.length - 1;

  return {
    ...g,
    hand: stackIn(g.hand, [g.placed[li]]),
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
    hand: stackIn(g.hand, g.placed),
  };
}

export function SortHand(g: PlayArea): PlayArea {
  return {
    ...g,
    hand: g.hand.toSorted(),
  };
}

export function PlaceByChar(g: PlayArea, c: string): PlayArea {
  const matches = handLetters(g.hand)
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
  const idxStack = g.hand.findIndex((stack) =>
    stack.some((letter) => letter.id === id),
  );
  if (idxStack < 0) {
    return g;
  }

  const idxLetter = g.hand[idxStack].findIndex((letter) => letter.id === id);
  if (idxLetter < 0) {
    return g;
  }

  const letter = g.hand[idxStack][idxLetter];

  let nextHand = [...g.hand];
  nextHand[idxStack] = [
    ...nextHand[idxStack].slice(0, idxLetter),
    ...nextHand[idxStack].slice(idxLetter + 1),
  ];

  return {
    ...g,
    placed: [...g.placed, letter],
    hand: nextHand,
  };
}
