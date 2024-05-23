//Battler represents both human and computer players

import type { Letter } from "./letter";
import { lettersToString, stringToLetters } from "./letter";

import type { PlayArea } from "./playarea";
import { letterSlotsToString } from "./playarea";

import type { Opponent } from "./opponent";

import type { AbilityCard, AbilityImpl } from "./ability";
import { AbilityCards, AbilityImpls } from "./ability";

import type { BonusCard } from "./bonus";
import { BonusImpls, BonusCards } from "./bonus";

import type { Scoresheet } from "./score";
import { ScoreWord } from "./score";

import type { ScoredWord, BonusQuery, ServerFunctions, PRNG } from "./util";

import { CopyMap } from "./util";

export interface Battler {
  health: number;

  playArea: PlayArea;
  profile: Opponent;

  checking: boolean;
  scoresheet?: Scoresheet;

  hyperbank: Map<string, boolean>;
  wordbank: Map<string, ScoredWord>;

  abilities: Map<string, AbilityCard>;
  bonuses: Map<string, BonusCard>;

  wordMatches: string[];
}

export interface BattlerSetup {
  handSize: number;
  prng: PRNG;
  letters: Letter[];
  bonuses: Map<string, BonusCard>;
  abilities: Map<string, AbilityCard>;
  profile: Opponent;
}

export function NewBattler(bs: BattlerSetup): Battler {
  return {
    health: bs.profile.healthMax,

    abilities: CopyMap(bs.abilities),
    bonuses: CopyMap(bs.bonuses),

    checking: false,
    scoresheet: undefined,
    wordMatches: [],

    profile: bs.profile,
    hyperbank: new Map<string, boolean>(),
    wordbank: new Map<string, ScoredWord>(),

    playArea: {
      prng: bs.prng,
      handSize: bs.handSize,
      bag: bs.letters,
      hand: [],
      placed: [],
    },
  };
}

export function AbilityChecks(b: Battler): Battler {
  let upd = new Map<string, AbilityCard>();
  for (const [k, v] of b.abilities) {
    const impl = AbilityImpls.get(k);
    if (impl === undefined) {
      console.log(`No implementation found for bonus ${k}`);
      continue;
    }
    upd.set(k, {
      ...v,
      ok: v.uses > 0 && impl.pred(b.playArea),
    });
  }

  return {
    ...b,
    abilities: upd,
  };
}

export function UseAbilityReal(g: Battler, key: string): Battler {
  const impl = AbilityImpls.get(key);
  if (impl === undefined) {
    console.log(`No implementation found for ability ${key}`);
    return g;
  }

  const ability = g.abilities.get(key);
  if (ability === undefined) {
    console.log(`No card found for ability ${key}`);
    return g;
  }

  let nextAbilities = new Map<string, AbilityCard>();
  for (const [k, v] of g.abilities) {
    if (k === key) {
      let x = { ...v };
      x.uses -= 1;
      nextAbilities.set(k, x);
    } else {
      nextAbilities.set(k, v);
    }
  }

  return AbilityChecks({
    ...g,
    playArea: impl.func(g.playArea),
    scoresheet: undefined,
    abilities: nextAbilities,
  });
}

// This function only uses the simple score of a word
// That is, its letter score
// No bonuses / weaknesses are included
// Doing the full server round trip for every word, no way
// There could be a server-side solution...
export async function WordbankCheck(
  kb: ServerFunctions,
  g: Battler,
): Promise<string[]> {
  let letters =
    letterSlotsToString(g.playArea.hand) + lettersToString(g.playArea.placed);

  const hypers = [...g.hyperbank.keys()];
  const words = [...g.wordbank.values()];

  const bonusQueries: BonusQuery[] = [];
  for (const [k, bonus] of g.bonuses) {
    const s = BonusImpls.get(bonus.key);
    if (!s) {
      continue;
    }
    bonusQueries.push({ query: s.query, score: bonus.weight * bonus.level });
  }

  const suggestedWords = await kb.suggestions(
    letters,
    hypers,
    words,
    bonusQueries,
    20,
  );

  return suggestedWords.map((a) => a.word);
}

export async function NextWord(g: Battler, round: number): Promise<Letter[]> {
  let res: Letter[] = [];

  const keys = [...g.wordbank.keys()];
  const choice = g.wordbank.get(keys[round % keys.length]);
  if (choice !== undefined) {
    res = stringToLetters(choice.word, choice.word);
  }

  if (g.profile.level > 7) {
    const incr = Math.min(4, g.profile.level - 7);
    for (const c of res) {
      c.level += incr;
      c.score += incr;
    }
  }

  return res;
}

export async function UpdateScore(
  g: Battler,
  o: Battler,
  kb: ServerFunctions,
): Promise<Scoresheet> {
  return await ScoreWord(
    kb,
    g.playArea.placed,
    g.bonuses,
    o.profile.weakness,
    lettersToString(o.playArea.placed),
  );
}
