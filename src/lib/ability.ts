//ability
// This one's a bit of a miss, not gonna lie
// The idea was to have them only work on a player's own playarea
// But that really limits what they can do too
// They're super useful in play, but limited in variety severely

import { Letter } from "./letter";

import {
  PlayArea,
  DiscardPlaced,
  DrawByIndex,
  Draw,
  DrawN,
  AddToHand,
  UnplaceLast,
  UnplaceById,
  PlaceById,
} from "./playarea";

export interface AbilityCard {
  key: string;
  name: string;
  desc: string;
  uses: number;
  ok: boolean;
}

// pred -> predicate, I just wanted it to be four letters like func
export interface AbilityImpl {
  pred: (pr: PlayArea) => boolean;
  func: (pr: PlayArea) => PlayArea;
}

interface AbilityBase {
  key: string;
  name: string;
  desc: string;
  pred: (pr: PlayArea) => boolean;
  func: (pr: PlayArea) => PlayArea;
}

const AbilitiesBase: AbilityBase[] = [
  {
    key: "drawvowel",
    name: "Vowel Me",
    desc: "Conjure up one of every vowel",
    pred: (pr: PlayArea): boolean => {
      return true;
    },
    func: (pr: PlayArea): PlayArea => {
      let num = pr.placed.length + pr.hand.length;
      let xs: Letter[] = [];
      for (const c of "AEIOU") {
        xs.push({
          id: `vowel-magic-${num}-${c}`,
          char: c,
          base: 1,
          bonus: 1,
          temporary: true,
        });
      }
      return AddToHand(pr, xs);
    },
  },

  {
    key: "dump",
    name: "Dump",
    desc: "Discard placed letters, draw new letters",
    pred: (pr: PlayArea): boolean => {
      return pr.placed.length > 0;
    },
    func: (pr: PlayArea): PlayArea => {
      if (pr.placed.length === 0) {
        return pr;
      }

      return DrawN(DiscardPlaced(pr), pr.placed.length);
    },
  },

  {
    key: "clone",
    name: "Clone",
    desc: "Turn placed letters in clone of leftmost placed letter",
    pred: (pr: PlayArea): boolean => {
      return pr.placed.length > 1;
    },
    func: (pr: PlayArea): PlayArea => {
      if (pr.placed.length < 2) {
        return pr;
      }

      const len = pr.placed.length;
      let clones: Letter[] = [];
      for (const letter of pr.placed.slice(1)) {
        const clone = {
          ...pr.placed[0],
          id: `${letter.id}-clone-of-${pr.placed[0].id}`,
          temporary: true,
        };
        clones.push(clone);
      }

      let ret = { ...pr };
      ret = UnplaceById(ret, pr.placed[0].id);
      ret = DiscardPlaced(ret);
      ret = PlaceById(ret, pr.placed[0].id);

      return {
        ...ret,
        placed: ret.placed.concat(clones),
      };
    },
  },

  {
    key: "vampire",
    name: "Vampirism",
    desc: "Leftmost placed letter absorbs all other placed letters' bonuses",
    pred: (pr: PlayArea): boolean => {
      return pr.placed.length > 1;
    },
    func: (pr: PlayArea): PlayArea => {
      if (pr.placed.length < 2) {
        return pr;
      }

      let boost = 0;
      let drained: Letter[] = [];
      for (const letter of pr.placed.slice(1)) {
        boost += letter.bonus;
        drained.push({ ...letter, bonus: 0 });
      }

      const boosted = {
        ...pr.placed[0],
        bonus: pr.placed[0].bonus + boost,
      };

      return {
        ...pr,
        placed: [boosted, ...drained],
      };
    },
  },

  {
    key: "shiftleft",
    name: "Shift Left",
    desc: "Placed letters are transformed into their preceding letter in the alphabet",
    pred: (pr: PlayArea): boolean => {
      return pr.placed.length > 0;
    },
    func: (pr: PlayArea): PlayArea => {
      if (pr.placed.length < 1) {
        return pr;
      }

      let shifted: Letter[] = [];
      for (const letter of pr.placed) {
        const char =
          letter.char === "A"
            ? "Z"
            : String.fromCharCode(letter.char.charCodeAt(0) - 1);
        shifted.push({
          ...letter,
          char: char,
        });
      }

      return {
        ...pr,
        placed: shifted,
      };
    },
  },

  {
    key: "shiftright",
    name: "Shift Right",
    desc: "Placed letters are transformed into their succeeding letter in the alphabet",
    pred: (pr: PlayArea): boolean => {
      return pr.placed.length > 0;
    },
    func: (pr: PlayArea): PlayArea => {
      if (pr.placed.length < 1) {
        return pr;
      }

      let shifted: Letter[] = [];
      for (const letter of pr.placed) {
        const char =
          letter.char === "Z"
            ? "A"
            : String.fromCharCode(letter.char.charCodeAt(0) + 1);
        shifted.push({
          ...letter,
          char: char,
        });
      }

      return {
        ...pr,
        placed: shifted,
      };
    },
  },
];

export const AbilityCards = new Map(
  AbilitiesBase.map((x) => [
    x.key,
    {
      key: x.key,
      name: x.name,
      desc: x.desc,
      uses: 1,
      ok: false,
    },
  ]),
);

export const AbilityImpls = new Map(
  AbilitiesBase.map((x) => [
    x.key,
    {
      pred: x.pred,
      func: x.func,
    },
  ]),
);
