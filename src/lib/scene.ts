//overworld
// a sequence of scenes linked by decisions
// possible scenes are
// - battle
// - treasure chest
// - item shop
// - more!

import type { Player } from "./player";
import {
  NewPlayer,
  NewPlayerCheat,
  AddShopItem,
  ClaimLootItem,
  LevelUp,
} from "./player";

import type { Opponent } from "./opponent";
import { NewOpponent, NewBoss } from "./opponent";

import type { LootContainer } from "./loot";
import {
  FirstLootContainer,
  NewLootContainer,
  NewBattleLootContainer,
} from "./loot";

import type { Shop } from "./shop";
import { NewShop } from "./shop";

import type { Battle } from "./battle";
import { NewBattle } from "./battle";

import type { PRNG } from "./util";

export interface Scene {
  prng: PRNG;

  player: Player;
  cheatmode: boolean;

  nextShop: number;
  nextLoot: number;
  nextOpponent: number;

  region: Region;
  regidx: number;

  intro: boolean;

  opponent?: Opponent;
  battle?: Battle;
  lost?: boolean;
  battleloot?: LootContainer;

  loot?: LootContainer;

  shop?: Shop;

  exit?: string; // connection chosen to leave, also indicator that scene is done
}

export interface Region {
  name: string;
  minLevel: number;
  maxLevel: number;

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

export function FirstSceneCheat(prng: PRNG): Scene {
  return {
    prng: prng,
    player: NewPlayerCheat(),
    cheatmode: true,
    nextShop: 1,
    nextLoot: 1,
    nextOpponent: 1,
    region: {
      name: "Your Journey Begins",
      minLevel: 1,
      maxLevel: 1,
      path: ["meadow.jpg"],
      connections: ["Cave", "Forest"],
    },
    regidx: 0,
    intro: true,
    loot: FirstLootContainer(),
  };
}

export function FirstScene(prng: PRNG): Scene {
  return {
    prng: prng,
    player: NewPlayer(),
    cheatmode: false,
    nextShop: prng(3, 5),
    nextLoot: 1,
    nextOpponent: prng(1, 3),
    region: {
      name: "Your Journey Begins",
      minLevel: 1,
      maxLevel: 1,
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

  let nextLoot = scene.nextLoot - 1;
  let loot = undefined;
  if (scene.cheatmode || nextLoot < 1) {
    loot = await NewLootContainer(
      scene.prng,
      scene.prng(region.minLevel, region.maxLevel),
    );
    nextLoot = scene.cheatmode ? 1 : scene.prng(1, 3);
  }

  let nextOpponent = scene.nextOpponent - 1;
  let opponent = undefined;
  if (regidx + 1 === region.path.length) {
    opponent = await NewBoss(region.name, region.maxLevel + 1);
  } else if (scene.cheatmode || nextOpponent < 1) {
    opponent = await NewOpponent(
      scene.prng,
      region.name,
      region.minLevel,
      region.maxLevel,
    );
    nextOpponent = scene.cheatmode ? 1 : scene.prng(1, 3);
  }

  let nextShop = scene.nextShop - 1;
  let shop = undefined;
  if (scene.cheatmode || nextShop < 1) {
    shop = await NewShop(scene.prng, region.maxLevel, scene.player.bag);
    nextShop = scene.cheatmode ? 1 : scene.prng(2, 4);
  }

  return {
    ...scene,
    region: region,
    regidx: regidx,

    nextShop: nextShop,
    nextLoot: nextLoot,
    nextOpponent: nextOpponent,

    intro: true,
    opponent: opponent,
    loot: loot,
    shop: shop,
  };
}

export async function SetShop(scene: Scene, shop: Shop): Promise<Scene> {
  if (!shop.done) {
    scene.shop = shop;
    return scene;
  }

  let player = { ...scene.player };
  for (const item of shop.bought) {
    player = AddShopItem(player, item);
  }

  return {
    ...scene,
    player: player,
    shop: undefined,
  };
}

export async function SetBattle(scene: Scene, battle: Battle): Promise<Scene> {
  if (!battle) {
    return scene;
  }

  if (battle.done && battle.victory) {
    return {
      ...scene,
      battleloot: await NewBattleLootContainer(
        scene.prng,
        battle.opponent.profile,
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
    maxLevel: 4,

    path: [
      "castle-entrance.jpg",
      "castle-garden.jpg",
      "castle-room.jpg",
      "castle-dining-hall.jpg",
      "castle-sitting-room.jpg",
      "castle-throne.jpg",
    ],

    connections: ["Sewer", "Mushroom Forest"],
  },

  {
    name: "Mushroom Forest",
    minLevel: 5,
    maxLevel: 7,

    path: [
      "mushroom-1.jpg",
      "mushroom-3.jpg",
      "mushroom-4.jpg",
      "mushroom-5.jpg",
      "mushroom-6.jpg",
    ],

    connections: ["City"],
  },

  {
    name: "Sewer",
    minLevel: 5,
    maxLevel: 7,

    path: [
      "sewer-entrance.jpg",
      "sewer-1.jpg",
      "sewer-2.jpg",
      "sewer-3.jpg",
      "sewer-boss.jpg",
    ],

    connections: ["City"],
  },

  {
    name: "City",
    minLevel: 8,
    maxLevel: 10,

    path: [
      "city-1.jpg",
      "city-2.jpg",
      "city-3.jpg",
      "city-4.jpg",
      "city-5.jpg",
    ],

    connections: ["Sea", "Jungle"],
  },

  {
    name: "Sea",
    minLevel: 11,
    maxLevel: 15,

    path: ["sea-1.jpg", "sea-2.jpg", "sea-3.jpg", "sea-4.jpg", "sea-5.jpg"],

    connections: ["Jungle"],
  },

  {
    name: "Jungle",
    minLevel: 11,
    maxLevel: 15,

    path: [
      "jungle-1.jpg",
      "jungle-2.jpg",
      "jungle-3.jpg",
      "jungle-4.jpg",
      "jungle-5.jpg",
    ],

    connections: ["Sea"],
  },
];
