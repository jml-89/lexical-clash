//battle
// The actual game!

"use client";

import type { Letter } from "./letter";
import {
  ScrabbleDistribution,
  lettersToString,
  stringToLetters,
  simpleScore,
} from "./letter";

import type { PlayArea } from "./playarea";
import { Draw, UnplaceAll, PlaceWord, DiscardAll } from "./playarea";

import type { Opponent } from "./opponent";
import { PlayerProfile } from "./opponent";

import type { AbilityCard } from "./ability";
import type { BonusCard } from "./bonus";
import type { Scoresheet } from "./score";

import type { Battler, BattlerSetup } from "./battler";
import {
  NewBattler,
  AbilityChecks,
  UseAbilityReal,
  WordbankCheck,
  NextWord,
  UpdateScore,
} from "./battler";

import type { ScoredWord, BonusQuery, ServerFunctions, PRNG } from "./util";
import { CopyMap, ShuffleMap, Shuffle } from "./util";

export async function FillWordbank(
  lookup: (s: string) => Promise<ScoredWord[]>,
  o: Battler,
): Promise<ScoredWord[]> {
  let xs = [];
  for (const s of o.profile.strength) {
    for (const word of await lookup(s)) {
      xs.push(word);
    }
  }

  const minScore = 4 + 4 * (o.profile.level - 1);
  const maxScore = 9 + 5 * (o.profile.level - 1);
  const scoreInRange = (xs: ScoredWord): boolean => {
    return minScore <= xs.score && xs.score <= maxScore;
  };

  let ys = xs.filter(scoreInRange);

  // This happens when the level gets too high
  // This is a signal to just go huge, use best words
  if (ys.length < 10) {
    ys = xs.toSorted((a, b) => b.score - a.score).slice(0, 20);
  }

  return ys;
}

export interface Battle {
  type: "battle";

  kb: ServerFunctions;
  prng: PRNG;
  done: boolean;
  victory: boolean;

  round: number;

  player: Battler;
  opponent: Battler;
}

export interface BattleSetup {
  handSize: number;
  letters: Letter[];
  kb: ServerFunctions;
  prng: PRNG;

  hyperbank: Map<string, boolean>;
  wordbank: Map<string, ScoredWord>;

  bonuses: Map<string, BonusCard>;
  abilities: Map<string, AbilityCard>;

  opponent: Opponent;
}

export async function NewBattle(bs: BattleSetup): Promise<Battle> {
  const battle: Battle = {
    ...bs,

    type: "battle",

    done: false,
    victory: false,

    round: 0,

    player: NewBattler({
      ...bs,
      profile: PlayerProfile,
    }),

    opponent: NewBattler({
      handSize: 9,
      prng: bs.prng,
      letters: bs.letters,
      bonuses: new Map<string, BonusCard>(),
      abilities: new Map<string, AbilityCard>(),
      profile: bs.opponent,
    }),
  };

  const words = await FillWordbank(battle.kb.hypos, battle.opponent);
  for (const word of words) {
    battle.opponent.wordbank.set(word.word, word);
  }

  battle.opponent.wordbank = ShuffleMap(battle.prng, battle.opponent.wordbank);
  battle.player.wordbank = bs.wordbank;
  battle.player.hyperbank = bs.hyperbank;

  await NextRound(battle);
  return battle;
}

export async function UseAbility(g: Battle, key: string): Promise<void> {
  g.player = UseAbilityReal(g.player, key);
  g.player.wordMatches = await WordbankCheck(g.kb, g.player);
}

async function NextRound(g: Battle): Promise<void> {
  g.round = g.round + 1;

  g.player = { ...g.player };
  g.player.playArea = Draw(DiscardAll(g.player.playArea));
  g.player.wordMatches = await WordbankCheck(g.kb, g.player);
  g.player = AbilityChecks(g.player);
  g.player.scoresheet = await UpdateScore(g.player, g.opponent, g.kb);

  g.opponent = { ...g.opponent };
  g.opponent.playArea = Draw(DiscardAll(g.opponent.playArea));
  g.opponent.playArea.placed = await NextWord(g.opponent, g.round);
  g.opponent.scoresheet = await UpdateScore(g.opponent, g.player, g.kb);
}

export async function Submit(g: Battle): Promise<void> {
  if (!(g.player.scoresheet && g.opponent.scoresheet)) {
    return;
  }

  const diff = g.player.scoresheet.score - g.opponent.scoresheet.score;
  if (diff > 0) {
    g.opponent = { ...g.opponent, health: g.opponent.health - diff };
  } else if (diff < 0) {
    g.player = { ...g.player, health: g.player.health + diff };
  }

  const str = lettersToString(g.player.playArea.placed);
  if (!g.player.wordbank.has(str)) {
    // This is a little goofy, but the player may have used enhanced letters
    // To get a "true" score, have to do this
    const n = simpleScore(stringToLetters("tmp", str));
    g.player.wordbank.set(str, {
      word: str,
      base: n,
      score: n,
    });
  }

  if (g.player.health <= 0) {
    g.victory = false;
    g.done = true;
    return;
  }

  if (g.opponent.health <= 0) {
    g.victory = true;
    g.done = true;
    return;
  }

  await NextRound(g);
}

export async function OnPlayArea(
  g: Battle,
  fn: (p: PlayArea) => PlayArea,
): Promise<void> {
  g.player = AbilityChecks({
    ...g.player,
    playArea: fn(g.player.playArea),
    scoresheet: undefined,
  });
}

export async function PlaceWordbank(g: Battle, id: string): Promise<void> {
  OnPlayArea(g, (p) => PlaceWord(UnplaceAll(g.player.playArea), id));
}

export async function UpdateScores(g: Battle): Promise<void> {
  g.player = {
    ...g.player,
    scoresheet: await UpdateScore(g.player, g.opponent, g.kb),
    checking: false,
  };
}

export async function Checking(g: Battle): Promise<void> {
  g.player = { ...g.player, checking: true };
}
