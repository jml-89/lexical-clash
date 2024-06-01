//overworld
// a sequence of scenes linked by decisions
// possible scenes are
// - battle
// - treasure chest
// - item shop
// - more!

import type { Player } from "./player";
import { ClaimLootItem, LevelUp } from "./player";

import type { Opponent } from "./opponent";
import { NewOpponent, NewBoss } from "./opponent";

import type { LootContainer } from "./loot";
import { FirstLootContainer, NewLootContainer } from "./loot";

import type { Battle } from "./battle";
import { NewBattle } from "./battle";

import type { PRNG } from "./util";

export interface Scene {
  prng: PRNG;

  player: Player;

  region: Region;
  regidx: number;

  intro: boolean;
  opponent?: Opponent;
  battle?: Battle;
  lost?: boolean;
  battleloot?: LootContainer;
  loot?: LootContainer;
  exit?: string; // connection chosen to leave, also indicator that scene is done
}

export interface Region {
  name: string;
  minLevel: number;
  maxLevel: number;
  lootpct: number;
  opponentpct: number;

  path: string[];

  connections: string[];
}

export async function EndIntro(scene: Scene): Promise<Scene> {
  return {
    ...scene,
    intro: false,
  };
}

export async function TakeBattleLootItem(scene: Scene): Promise<Scene> {
  if (!scene.battleloot) {
    return scene;
  }

  const [player, battleloot] = ClaimLootItem(scene.player, scene.battleloot);
  return {
    ...scene,
    player: player,
    battleloot: battleloot.contents.length > 0 ? battleloot : undefined,
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
    loot: loot.contents.length > 0 ? loot : undefined,
  };
}

export function FirstScene(prng: PRNG, player: Player): Scene {
  return {
    prng: prng,
    player: player,
    region: {
      name: "Your Journey Begins",
      minLevel: 1,
      maxLevel: 1,
      lootpct: 0,
      opponentpct: 0,
      path: ["meadow.jpg"],
      connections: ["Cave", "Forest"],
    },
    regidx: 0,
    intro: true,
    loot: FirstLootContainer(),
  };
}

export async function StartBattle(scene: Scene): Promise<Scene> {
  if (!scene.opponent) {
    return scene;
  }

  return {
    ...scene,
    opponent: undefined,
    battle: await NewBattle(scene.prng, scene.player, scene.opponent),
  };
}

export async function NextScene(scene: Scene): Promise<Scene> {
  let region = undefined;
  let regidx = scene.regidx;
  if (scene.exit) {
    region = regions.find((region) => region.path[0] === scene.exit);
    if (region) {
      regidx = 0;
    }
  }
  if (!region) {
    region = scene.region;
    regidx = regidx + 1;
  }

  let loot = undefined;
  if (scene.prng(0, 100) <= region.lootpct) {
    loot = await NewLootContainer(
      scene.prng,
      scene.prng(region.minLevel, region.maxLevel),
      false,
    );
  }

  let opponent = undefined;
  if (regidx + 1 === region.path.length) {
    opponent = await NewBoss(region.name, region.maxLevel + 1);
  } else if (scene.prng(0, 100) <= region.opponentpct) {
    opponent = await NewOpponent(
      scene.prng,
      region.name,
      region.minLevel,
      region.maxLevel,
    );
  }

  return {
    prng: scene.prng,
    region: region,
    regidx: regidx,
    intro: true,
    player: scene.player,
    opponent: opponent,
    loot: loot,
  };
}

export async function SetBattle(scene: Scene, battle: Battle): Promise<Scene> {
  if (!battle) {
    return scene;
  }

  if (battle.done && battle.victory) {
    return {
      ...scene,
      battleloot: await NewLootContainer(
        scene.prng,
        battle.opponent.profile.level,
        true,
      ),
      player: LevelUp(scene.player),
      battle: undefined,
    };
  }

  if (battle.done && !battle.victory) {
    return {
      ...scene,
      lost: true,
      battle: undefined,
    };
  }

  scene.battle = battle;
  return scene;
}

export function GetConnectedLocations(scene: Scene): string[] {
  const nextidx = scene.regidx + 1;
  if (nextidx < scene.region.path.length) {
    return [scene.region.path[nextidx]];
  }

  let res: string[] = [];
  for (const connection of scene.region.connections) {
    const region = regions.find((region) => region.name === connection);
    if (region) {
      res.push(region.path[0]);
    }
  }

  return res;
}

export async function ChooseConnection(
  scene: Scene,
  key: string,
): Promise<Scene> {
  return await NextScene({ ...scene, exit: key });
}

const regions = [
  {
    name: "Forest",
    minLevel: 1,
    maxLevel: 2,
    lootpct: 30,
    opponentpct: 60,

    path: [
      "forest-path.jpg",
      "forest-bright.jpg",
      "forest-steps.jpg",
      "cottage-entrance.jpg",
      "cottage-interior.jpg",
    ],

    connections: ["Castle"],
  },

  {
    name: "Cave",
    minLevel: 1,
    maxLevel: 2,
    lootpct: 30,
    opponentpct: 60,

    path: [
      "cave-entrance.jpg",
      "cave-inside.jpg",
      "cave-river.jpg",
      "cave-camp.jpg",
    ],

    connections: ["Castle"],
  },

  {
    name: "Castle",
    minLevel: 3,
    maxLevel: 5,
    lootpct: 50,
    opponentpct: 60,

    path: [
      "castle-entrance.jpg",
      "castle-garden.jpg",
      "castle-room.jpg",
      "castle-dining-hall.jpg",
      "castle-sitting-room.jpg",
      "castle-throne.jpg",
    ],

    connections: ["Sewer"],
  },

  {
    name: "Sewer",
    minLevel: 8,
    maxLevel: 11,
    lootpct: 50,
    opponentpct: 60,

    path: [
      "sewer-entrance.jpg",
      "sewer-1.jpg",
      "sewer-2.jpg",
      "sewer-3.jpg",
      "sewer-boss.jpg",
    ],

    connections: ["Forest"],
  },
];
