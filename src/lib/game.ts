"use client";

import {
  Letter,
  lettersToString,
  stringToLetters,
  ScrabbleDistribution,
} from "./letter";

import { Opponent, PlayerProfile } from "./opponent";

import prand from "pure-rand";

import { Battle, NewBattle } from "./battle";

import { BonusCard, BonusCards, BonusImpl, BonusImpls } from "./bonus";
import { AbilityCard, AbilityCards } from "./ability";
import { ScoreWord } from "./score";

import type { Scene } from "./scene";
import { FirstScene, NextScene } from "./scene";

import type { Player } from "./player";
import { NewPlayer } from "./player";

import type { ServerFunctions } from "./wordnet";
import {
  ScoredWord,
  HyperSet,
  Shuffle,
  ShuffleMap,
  MapConcat,
  CopyMap,
  PRNG,
  RandState,
  CreateStatefulRand,
} from "./util";

export interface GameState {
  sessionid: string;
  rs: RandState;
  prng: PRNG;
  kb: ServerFunctions;

  scene: Scene;
}

export async function OnScene(
  g: GameState,
  fn: (s: Scene) => Promise<Scene>,
): Promise<GameState> {
  let scene = await fn(g.scene);
  if (scene.exit) {
    scene = await NextScene(scene);
  }

  return {
    ...g,
    scene: scene,
  };
}

/*
async function Rescore(g: GameState): Promise<Map<string, ScoredWord>> {
  const bonusQueries: BonusQuery[] = [];
  for (const [k, bonus] of g.bonuses) {
    const s = BonusImpls.get(bonus.key);
    if (!s) {
      continue;
    }
    bonusQueries.push({ query: s.query, score: bonus.weight * bonus.level });
  }

  const words = await g.kb.rescore([...g.wordbank.values()], bonusQueries);
  let xs = new Map<string, ScoredWord>();
  for (const word of words) {
    xs.set(word.word, word);
  }

  return xs;
}
*/

export async function SaveGame(g: GameState): Promise<void> {
  function maptup(k: any, v: any) {
    return v instanceof Map
      ? {
          maptuples: [...v],
        }
      : v;
  }

  await g.kb.save(g.sessionid, JSON.stringify(g, maptup));
}

export function LoadGame(o: Object, kb: ServerFunctions): GameState {
  const tupmap = (a: any): any => {
    if (!(a instanceof Object)) {
      return a;
    }

    if (a instanceof Array) {
      return a.map((b: any) => tupmap(b));
    }

    const o = <Object>a;

    for (const [field, value] of Object.entries(o)) {
      if (field === "maptuples") {
        return new Map<any, any>(tupmap(value));
      }
    }

    return Object.fromEntries(
      Object.entries(o).map(([field, value]) => [
        field,
        field === "prng"
          ? prand.xoroshiro128plus(1337)
          : field === "kb"
            ? kb
            : tupmap(value),
      ]),
    );
  };

  let ox = tupmap(o) as GameState;

  let [rs, prng] = CreateStatefulRand(ox.rs.seed);
  while (rs.iter < ox.rs.iter) {
    prng(0, 1);
  }

  ox.rs = rs;
  ox.prng = prng;

  return ox;
}

export function NewGame(
  sessionid: string,
  seed: number,
  kb: ServerFunctions,
): GameState {
  let [rs, prng] = CreateStatefulRand(seed);
  return {
    sessionid: sessionid,

    kb: kb,
    rs: rs,
    prng: prng,

    scene: FirstScene(kb, prng, NewPlayer()),
  };
}
