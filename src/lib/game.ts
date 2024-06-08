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

export async function SetScene(g: GameState, scene: Scene): Promise<GameState> {
  if (scene.exit) {
    g.scene = await NextScene(scene);
  } else {
    g.scene = scene;
  }
  return g;
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

export function NewGame(sessionid: string, seed: number): GameState {
  let [rs, prng] = CreateStatefulRand(seed);
  return {
    sessionid: sessionid,

    rs: rs,
    prng: prng,

    scene: sessionid === "test" ? FirstSceneCheat(prng) : FirstScene(prng),
  };
}
