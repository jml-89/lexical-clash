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

import type { Opponent } from "./opponent";
import { PlayerProfile } from "./opponent";

import type { AbilityCard } from "./ability";
import type { BonusCard } from "./bonus";
import type { Scoresheet } from "./score";

import type { Player } from "./player";

import type { Battler, ComBattler } from "./battler";
import {
  NewBattler,
  NewComBattler,
  AbilityChecks,
  UseAbilityReal,
  WordbankCheck,
  NextWord,
  NextHand,
  NextComHand,
} from "./battler";

import { ScoreWord } from "./score";

//UpdatePlayerScore,
//UpdateComScore,

import type { ServerFunctions } from "./wordnet";
import type { ScoredWord, PRNG } from "./util";
import { CopyMap, ShuffleMap, Shuffle } from "./util";

export async function FillWordbank(
  lookup: (s: string) => Promise<ScoredWord[]>,
  o: ComBattler,
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
  kb: ServerFunctions;
  prng: PRNG;

  done: boolean;
  victory: boolean;

  round: number;

  player: Battler;
  opponent: ComBattler;
}

export async function NewBattle(
  kb: ServerFunctions,
  prng: PRNG,
  player: Player,
  opponent: Opponent,
): Promise<Battle> {
  const battle: Battle = {
    kb: kb,
    prng: prng,

    done: false,
    victory: false,

    round: 0,

    player: NewBattler(prng, kb, player),
    opponent: NewComBattler(prng, kb, opponent),
  };

  return await NextRound(battle);
}

async function NextRound(g: Battle): Promise<Battle> {
  g = { ...g };

  g.round = g.round + 1;

  g.player = await NextHand(g.player);
  g.player.scoresheet = await UpdatePlayerScore(g);

  g.opponent = await NextComHand(g.opponent);
  g.opponent.scoresheet = await UpdateComScore(g);

  return g;
}

export async function Submit(g: Battle): Promise<Battle> {
  if (!(g.player.scoresheet && g.opponent.scoresheet)) {
    return g;
  }

  const diff = g.player.scoresheet.score - g.opponent.scoresheet.score;
  if (diff > 0) {
    g.opponent = { ...g.opponent, health: g.opponent.health - diff };
  } else if (diff < 0) {
    g.player = { ...g.player, health: g.player.health + diff };
  }

  g = { ...g };

  const str = lettersToString(g.player.playArea.placed);
  if (g.player.wordbank.findIndex((x) => x === str) < 0) {
    g.player.wordbank.push(str);
  }

  if (g.player.health <= 0) {
    g.victory = false;
    g.done = true;
    return g;
  }

  if (g.opponent.health <= 0) {
    g.victory = true;
    g.done = true;
    return g;
  }

  g = await NextRound(g);

  return g;
}

export async function OnBattler(
  b: Battle,
  fn: (p: Battler) => Promise<Battler>,
): Promise<Battle> {
  b = { ...b };
  b.player = await fn(b.player);
  if (b.player.checking) {
    b = await UpdateScores(b);
  }
  return b;
}

export async function UpdateScores(g: Battle): Promise<Battle> {
  return {
    ...g,
    player: {
      ...g.player,
      checking: false,
      scoresheet: await UpdatePlayerScore(g),
    },
  };
}

export async function UpdatePlayerScore(b: Battle): Promise<Scoresheet> {
  return await ScoreWord(
    b.kb,
    b.player.playArea.placed,
    b.player.bonuses,
    b.opponent.profile.weakness,
    lettersToString(b.opponent.playArea.placed),
  );
}

export async function UpdateComScore(b: Battle): Promise<Scoresheet> {
  return await ScoreWord(
    b.kb,
    b.opponent.playArea.placed,
    new Map<string, BonusCard>(),
    [],
    lettersToString(b.player.playArea.placed),
  );
}
