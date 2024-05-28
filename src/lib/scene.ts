//overworld
// a sequence of scenes linked by decisions
// possible scenes are
// - battle
// - treasure chest
// - item shop
// - more!

import type { Player } from "./player";
import { ClaimLootItem } from "./player";

import type { Opponent } from "./opponent";
import { NewOpponent } from "./opponent";

import type { LootContainer } from "./loot";
import { LootCount, FirstLootContainer, NewLootContainer } from "./loot";

import type { Battle } from "./battle";
import { NewBattle } from "./battle";

import type { ServerFunctions } from "./wordnet";
import type { PRNG, HyperSet } from "./util";

//type SceneState = "arrival" | "confrontation" | "battle" | "victory" | "defeat" | "departure";

export interface Scene {
  kb: ServerFunctions;
  prng: PRNG;

  title: string;
  desc?: string;
  image: string;

  //state: SceneState;

  player: Player;

  opponent?: Opponent;
  battle?: Battle;
  loot?: LootContainer;

  connections: string[];
  exit?: string; // connection chosen to leave, also indicator that scene is done
}

export async function EndIntro(scene: Scene): Promise<Scene> {
  return {
    ...scene,
    desc: undefined,
  };
}

export async function TakeLootItem(scene: Scene): Promise<Scene> {
  if (!scene.loot) {
    return scene;
  }

  const [player, loot] = ClaimLootItem(scene.player, scene.loot);
  return {
    ...scene,
    player: player,
    loot: LootCount(loot) > 0 ? loot : undefined,
  };
}

export function FirstScene(
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
    image: "field.jpg",

    loot: FirstLootContainer(),

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
  if (prng(0, 100) <= draft.lootpct) {
    loot = await NewLootContainer(kb, prng, draft.level);
  }

  let opponent = undefined;
  if (prng(0, 100) <= draft.opponentpct) {
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
    return {
      ...scene,
      player: { ...scene.player, handSize: scene.player.handSize + 1 },
      battle: undefined,
    };
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
      desc: "A verdant clearing, calm and safe",
      image: "meadow.jpg",

      level: 1,
      theme: "outside",

      lootpct: 100,
      opponentpct: 0,

      connections: ["Forest Path", "Cave Entrance"],
    },

    {
      title: "Forest Path",
      desc: "An overgrown path through a quiet forest",
      image: "forest-path.jpg",

      level: 1,
      theme: "outside",

      lootpct: 30,
      opponentpct: 30,

      connections: ["Castle Entrance", "Cave Entrance"],
    },

    {
      title: "Cave Entrance",
      desc: "The entrance to a dark cave",
      image: "cave-entrance.jpg",

      level: 1,
      theme: "underground",

      lootpct: 35,
      opponentpct: 50,

      connections: ["Forest Path", "Cave"],
    },

    {
      title: "Cave",
      desc: "A forboding cave",
      image: "cave-inside.jpg",

      level: 2,
      theme: "underground",

      lootpct: 35,
      opponentpct: 50,

      connections: ["Cave River", "Cave Camp"],
    },

    {
      title: "Cave River",
      desc: "A crystal blue river cutting through",
      image: "cave-river.jpg",

      level: 2,
      theme: "underground",

      lootpct: 35,
      opponentpct: 50,

      connections: ["Cave Camp", "Cave Exit"],
    },

    {
      title: "Cave Camp",
      desc: "A hidden rogue's camp",
      image: "cave-camp.jpg",

      level: 3,
      theme: "underground",

      lootpct: 85,
      opponentpct: 80,

      connections: ["Cave Exit"],
    },

    {
      title: "Cave Exit",
      desc: "A welcome sight",
      image: "cave-exit.jpg",

      level: 3,
      theme: "underground",

      lootpct: 25,
      opponentpct: 40,

      connections: ["Castle Entrance"],
    },

    {
      title: "Castle Entrance",
      desc: "A grand home",
      image: "castle-entrance.jpg",

      level: 3,
      theme: "castle",

      lootpct: 25,
      opponentpct: 40,

      connections: ["Castle Room"],
    },

    {
      title: "Castle Room",
      desc: "One of many rooms here",
      image: "castle-room.jpg",

      level: 3,
      theme: "castle",

      lootpct: 25,
      opponentpct: 40,

      connections: ["Castle Throne"],
    },

    {
      title: "Castle Throne",
      desc: "A grand throne room",
      image: "castle-throne.jpg",

      level: 3,
      theme: "castle",

      lootpct: 95,
      opponentpct: 60,

      connections: ["Castle Garden"],
    },
  ].map((draft) => [draft.title, draft]),
);
