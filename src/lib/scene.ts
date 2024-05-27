//overworld
// a sequence of scenes linked by decisions
// possible scenes are
// - battle
// - treasure chest
// - item shop
// - more!

import type { Player } from "./player";

import type { Opponent } from "./opponent";
import { NewOpponent } from "./opponent";

import type { LootContainer } from "./loot";
import { NewLootContainer } from "./loot";

import type { Battle } from "./battle";
import { NewBattle } from "./battle";

import type { ServerFunctions } from "./wordnet";
import type { PRNG, HyperSet } from "./util";

export interface Scene {
  kb: ServerFunctions;
  prng: PRNG;

  exit?: string; // connection chosen to leave, also indicator that scene is done

  title: string;
  desc: string;
  image: string;

  player: Player;
  opponent?: Opponent;
  battle?: Battle;

  loot?: LootContainer;
  connections: string[];
}

export function DefaultScene(
  kb: ServerFunctions,
  prng: PRNG,
  player: Player,
): Scene {
  return {
    kb: kb,
    prng: prng,
    player: player,
    title: "Welcome",
    desc: "Your journey begins",
    image: "bg/field.jpg",
    connections: ["Meadow"],
  };
}

export async function StartBattle(scene: Scene): Promise<Scene> {
  if (!scene.opponent) {
    return scene;
  }

  return {
    ...scene,
    opponent: undefined,
    battle: await NewBattle(scene.kb, scene.prng, scene.player, scene.opponent),
  };
}

export async function NextScene(scene: Scene): Promise<Scene> {
  const exit = scene.exit ? scene.exit : "Meadow";
  return await NewScene(scene.kb, scene.prng, scene.player, exit);
}

export async function NewScene(
  kb: ServerFunctions,
  prng: PRNG,
  player: Player,
  key: string,
): Promise<Scene> {
  const draft = drafts.get(key);
  if (!draft) {
    throw `NewScene: {key} not found`;
  }

  let loot = undefined;
  if (prng(0, 100) > draft.lootpct) {
    loot = await NewLootContainer(kb, prng, draft.level);
  }

  let opponent = undefined;
  if (prng(0, 100) > draft.opponentpct) {
    opponent = await NewOpponent(kb, prng, draft.level, draft.theme);
  }

  //Use all the links for now
  //Down the track will trim links when that is of interest
  let conns: string[] = [];
  for (const link of draft.connections) {
    conns.push(link);
  }

  return {
    kb: kb,
    prng: prng,
    title: draft.title,
    desc: draft.desc,
    image: draft.image,
    player: player,
    opponent: opponent,
    loot: loot,
    connections: conns,
  };
}

export async function OnBattle(
  scene: Scene,
  fn: (b: Battle) => Promise<Battle>,
): Promise<Scene> {
  if (!scene.battle) {
    return scene;
  }
  const battle = await fn(scene.battle);
  if (battle.done) {
    return { ...scene, battle: undefined };
  }

  return { ...scene, battle: battle };
}

export function GetConnectedScenes(scene: Scene): SceneDraft[] {
  let res: SceneDraft[] = [];
  for (const connection of scene.connections) {
    const draft = drafts.get(connection);
    if (draft) {
      res.push(draft);
    }
  }
  return [...res.values()];
}

export async function ChooseConnection(
  scene: Scene,
  key: string,
): Promise<Scene> {
  return {
    ...scene,
    exit: key,
  };
}

//Draft of a scene gets pressed into a concrete scene later
//level and theme used to guide opponent and loot selection
export interface SceneDraft {
  title: string;
  desc: string;
  image: string;

  level: number;
  theme: string;

  //keys of other scenes this scene can connect to
  connections: string[];

  //value range: (0-100), representing the likelihood of loot appearing
  lootpct: number;

  //value range: (0-100), representing the likelihood of an opponent appearing
  opponentpct: number;
}

//One could imagine this being in the database instead, naturally
const drafts = new Map<string, SceneDraft>(
  [
    {
      title: "Meadow",
      desc: "A verdant clearing",
      image: "bg/meadow.jpg",

      level: 1,
      theme: "outside",

      lootpct: 30,
      opponentpct: 0,

      connections: ["Forest", "Cave"],
    },

    {
      title: "Forest",
      desc: "A quiet forest",
      image: "bg/forest.jpg",

      level: 2,
      theme: "outside",

      lootpct: 30,
      opponentpct: 30,

      connections: ["Meadow", "Cave"],
    },

    {
      title: "Cave",
      desc: "A dark cave",
      image: "bg/cave.jpg",

      level: 3,
      theme: "underground",

      lootpct: 65,
      opponentpct: 70,

      connections: ["Forest"],
    },
  ].map((draft) => [draft.title, draft]),
);
