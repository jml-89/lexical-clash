//Battler represents both human and computer players

import type { Letter } from "./letter";
import {
  ScrabbleDistribution,
  lettersToString,
  stringToLetters,
} from "./letter";

import type { PlayArea } from "./playarea";
import {
  usableLetters,
  letterSlotsToString,
  PlaceWord,
  UnplaceAll,
  NewHand,
} from "./playarea";

import type { Opponent } from "./opponent";

import type { AbilityCard, AbilityImpl } from "./ability";
import { AbilityCards, AbilityImpls } from "./ability";

import type { BonusCard } from "./bonus";
import { BonusImpls, BonusCards } from "./bonus";

import type { Scoresheet } from "./score";
import { ScoreWord } from "./score";

import { SuggestWords } from "./wordnet";
import type { ScoredWord, PRNG } from "./util";

import type { Player } from "./player";

import { CopyMap } from "./util";

export interface Battler {
  health: number;
  healthMax: number;
  playArea: PlayArea;
  checking: boolean;
  player: Player;
  scoresheet?: Scoresheet;
  wordMatches: string[];
}

export interface ComBattler {
  health: number;
  healthMax: number;
  profile: Opponent;
  playArea: PlayArea;
  scoresheet?: Scoresheet;
}

export function NewBattler(prng: PRNG, player: Player): Battler {
  return {
    health: 10 + player.level,
    healthMax: 10 + player.level,

    player: player,

    checking: false,
    scoresheet: undefined,
    wordMatches: [],

    playArea: {
      prng: prng,
      handSize: player.handSize,
      bag: player.bag,
      hand: [],
      placed: [],
    },
  };
}

export function NewComBattler(prng: PRNG, profile: Opponent): ComBattler {
  return {
    health: 10 + profile.level,
    healthMax: 10 + profile.level,
    profile: profile,
    scoresheet: undefined,
    playArea: {
      prng: prng,
      handSize: 2 + profile.level * 4,
      bag: ScrabbleDistribution(),
      hand: [],
      placed: [],
    },
  };
}

export async function PlaceWordbank(g: Battler, id: string): Promise<Battler> {
  let res = await OnPlayArea(g, (p) => PlaceWord(UnplaceAll(p), id));
  res.checking = true;
  return res;
}

export function AbilityChecks(b: Battler): Battler {
  let upd = new Map<string, AbilityCard>();
  for (const [k, v] of b.player.abilities) {
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
    player: {
      ...b.player,
      abilities: upd,
    },
  };
}

export function UseAbilityReal(g: Battler, key: string): Battler {
  const impl = AbilityImpls.get(key);
  if (impl === undefined) {
    console.log(`No implementation found for ability ${key}`);
    return g;
  }

  const ability = g.player.abilities.get(key);
  if (ability === undefined) {
    console.log(`No card found for ability ${key}`);
    return g;
  }

  let nextAbilities = new Map<string, AbilityCard>();
  for (const [k, v] of g.player.abilities) {
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
    player: {
      ...g.player,
      abilities: nextAbilities,
    },
  });
}

export async function WordbankCheck(g: Battler): Promise<string[]> {
  let letters = [...g.playArea.placed];
  for (const letter of g.playArea.hand) {
    if (letter) {
      letters.push(letter);
    }
  }

  const suggestedWords = await SuggestWords(
    letters,
    g.player.wordpacks.map((pack) => pack.hypernym),
    g.player.wordbank,
    [...g.player.bonuses.values()],
    20,
  );

  return suggestedWords.map((a) => a.word);
}

export async function NextComHand(g: ComBattler): Promise<ComBattler> {
  g = { ...g };
  g.playArea = NewHand(g.playArea);
  g.playArea.placed = await NextWord(g);
  return g;
}

export async function NextWord(g: ComBattler): Promise<Letter[]> {
  const suggestedWords = await SuggestWords(
    usableLetters(g.playArea),
    [g.profile.strength],
    [],
    [],
    5,
  );

  if (suggestedWords.length > 0) {
    const word = suggestedWords[0].word;
    return stringToLetters(word, word);
  }

  const fallbackWords = await SuggestWords(
    usableLetters(g.playArea),
    ["letter"],
    [],
    [],
    5,
  );

  if (fallbackWords.length > 0) {
    const word = fallbackWords[0].word;
    return stringToLetters(word, word);
  }

  return [];
}

export async function UseAbility(g: Battler, key: string): Promise<Battler> {
  let res = UseAbilityReal(g, key);
  res.wordMatches = await WordbankCheck(g);
  return res;
}

export async function OnPlayArea(
  g: Battler,
  fn: (p: PlayArea) => PlayArea,
): Promise<Battler> {
  return AbilityChecks({
    ...g,
    playArea: fn(g.playArea),
    scoresheet: undefined,
  });
}

export async function Checking(g: Battler): Promise<Battler> {
  return { ...g, checking: true };
}

export async function NextHand(g: Battler): Promise<Battler> {
  g = { ...g };
  g.playArea = NewHand(g.playArea);
  g.wordMatches = await WordbankCheck(g);
  g = AbilityChecks(g);
  return g;
}
