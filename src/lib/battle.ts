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

import type { Player } from "./player";
import type { Opponent } from "./opponent";
import type { Scoresheet } from "./score";

import type { Battler, ComBattler } from "./battler";
import { NewBattler, NewComBattler, NextHand, NextComHand } from "./battler";

import { ScoreWord } from "./score";

import type { ScoredWord, PRNG } from "./util";
import { CopyMap, ShuffleMap, Shuffle } from "./util";

export interface Battle {
  prng: PRNG;

  done: boolean;
  victory: boolean;

  round: number;

  player: Battler;
  opponent: ComBattler;
}

export async function NewBattle(
  prng: PRNG,
  player: Player,
  opponent: Opponent,
): Promise<Battle> {
  const battle: Battle = {
    prng: prng,

    done: false,
    victory: false,

    round: 0,

    player: NewBattler(prng, player),
    opponent: NewComBattler(prng, opponent),
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
  // oh no that's horrible
  if (g.player.player.wordbank.findIndex((x) => x === str) < 0) {
    g.player.player.wordbank.push(str);
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
    b.player.playArea.placed,
    [...b.player.player.bonuses.values()],
    b.opponent.profile.weakness,
    lettersToString(b.opponent.playArea.placed),
  );
}

export async function UpdateComScore(b: Battle): Promise<Scoresheet> {
  return await ScoreWord(b.opponent.playArea.placed);
}
