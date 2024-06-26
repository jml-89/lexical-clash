// If I can get a good set of data going, it can proc off cool things like
// - Etymology
// - Synonyms
// - Associations
// I like that direction, making the game more about words and meanings
//
// Eventually they'll have graphics, levels, etc.
//
// Bonuses may rely on information that only resides server side
// As such they need to be asynchronous

import { Letter, lettersToString } from "./letter";

// Bonuses are modifiers to the score produced by a given word

// Presentation / simple representation of a bonus
// Having the function as part of this can cause issues with server/client proxying
// At least that's what I encountered a time or two
export interface BonusCard {
  key: string;
  name: string;
  desc: string;
  weight: number;
  level: number;
}

type relationFunc = (
  relation: string,
  left: string,
  right: string,
) => Promise<boolean>;

export interface BonusImpl {
  query: string;
}

interface BonusBase {
  key: string;
  name: string;
  desc: string;
  weight: number;
  query: string;
}

const base: BonusBase[] = [
  {
    key: "double",
    name: "Double Letter",
    desc: "Same letter occurs twice in a row, e.g. gli[mm]er, h[oo]t",
    weight: 1,
    query: `word ~* '.*(.)\\1.*'`,
  },
  {
    key: "thth",
    name: "No Lisp",
    desc: "Word contains the sequence [th]",
    weight: 2,
    query: `word ilike '%th%'`,
  },
  {
    key: "short",
    name: "Short and Sweet",
    desc: "Word length is less than 4",
    weight: 1,
    query: `char_length(word) < 4`,
  },
  {
    key: "long",
    name: "Lettermaxing",
    desc: "Word length is greater than 5",
    weight: 1,
    query: `char_length(word) > 5`,
  },
  {
    key: "numbers",
    name: "Numbers Rock!",
    desc: "Word is a number e.g. fifty",
    weight: 2,
    query: `word in (
        select hypo from simplerelations where hyper = 'number'
      )`,
  },
  {
    key: "fauna",
    name: "Animal Knower",
    desc: "Word is an animal e.g. wombat",
    weight: 2,
    query: `word in (
        select hypo from simplerelations where hyper = 'fauna'
      )`,
  },
  {
    key: "flora",
    name: "Green Thumb",
    desc: "Word is a plant e.g. ivy",
    weight: 2,
    query: `word in (
        select hypo from simplerelations where hyper = 'flora'
      )`,
  },
  {
    key: "food",
    name: "Foodie",
    desc: "Word is a food e.g. pasta",
    weight: 2,
    query: `word in (
        select hypo from simplerelations where hyper = 'food'
      )`,
  },
  {
    key: "shape",
    name: "Shapeshifter",
    desc: "Word is a shape e.g. sphere",
    weight: 2,
    query: `word in (
        select hypo from simplerelations where hyper = 'shape'
      )`,
  },
  {
    key: "action",
    name: "Action!",
    desc: "Word is an action e.g. jog",
    weight: 2,
    query: `word in (
        select hypo from simplerelations where hyper = 'act'
      )`,
  },
  {
    key: "instrument",
    name: "Instrumental",
    desc: "Word is an instrument e.g. kazoo",
    weight: 2,
    query: `word in (
        select hypo from simplerelations where hyper = 'instrument'
      )`,
  },
];

export const BonusCards = new Map(
  base.map((bonus) => [
    bonus.key,
    {
      key: bonus.key,
      name: bonus.name,
      desc: bonus.desc,
      weight: bonus.weight,
      level: 1,
    },
  ]),
);

export const BonusImpls = new Map(
  base.map((bonus) => [bonus.key, { query: bonus.query }]),
);
