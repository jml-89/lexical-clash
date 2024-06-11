"use client";

import prand from "pure-rand";

import type { Scene } from "./scene";
import { FirstScene, FirstSceneCheat, NextScene } from "./scene";

import type { Player } from "./player";
import { NewPlayer } from "./player";

import { SetSession } from "./wordnet";

import type { PRNG, RandState } from "./util";
import { CreateStatefulRand } from "./util";

export interface GameState {
  sessionid: string;
  rs: RandState;
  prng: PRNG;

  scene: Scene;
}

export async function SaveGame(g: GameState): Promise<void> {
  function maptup(k: any, v: any) {
    return v instanceof Map
      ? {
          maptuples: [...v],
        }
      : v;
  }

  await SetSession(g.sessionid, JSON.stringify(g, maptup));
}

export function LoadGame(o: Object): GameState {
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
        field === "prng" ? prand.xoroshiro128plus(1337) : tupmap(value),
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

function genSessionId(seed: number, len: number): string {
  let [rs, prng] = CreateStatefulRand(seed);

  const s = "qwertyuiopasdfghjklzxcvbnm1234567890";
  let res: string[] = [];
  for (let i = 0; i < len; i++) {
    const idx = prng(0, s.length - 1);
    res.push(s[idx]);
  }

  return res.join("");
}

export function NewGame(seed: number, cheatmode?: boolean): GameState {
  const [rs, prng] = CreateStatefulRand(seed);
  const sessionId = genSessionId(seed, 9);

  return {
    sessionid: sessionId,

    rs: rs,
    prng: prng,

    scene: cheatmode ? FirstSceneCheat(prng) : FirstScene(prng),
  };
}
