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
import { FirstLootContainer, NewLootContainer } from "./loot";

import type { Battle } from "./battle";
import { NewBattle } from "./battle";

import type { PRNG } from "./util";

export interface Scene {
  prng: PRNG;

  location: Location;
  player: Player;

  intro: boolean;
  opponent?: Opponent;
  battle?: Battle;
  lost?: boolean;
  battleloot?: LootContainer;
  loot?: LootContainer;
  exit?: string; // connection chosen to leave, also indicator that scene is done
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
    location: [...locations.values()][0],
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
  const exit = scene.exit ? scene.exit : "Meadow";
  return await NewScene(scene.prng, scene.player, exit);
}

export async function NewScene(
  prng: PRNG,
  player: Player,
  key: string,
): Promise<Scene> {
  const location = locations.get(key);
  if (!location) {
    throw `NewScene: {key} not found`;
  }

  let loot = undefined;
  if (prng(0, 100) <= location.lootpct) {
    loot = await NewLootContainer(prng, location.level, false);
  }

  let opponent = undefined;
  if (prng(0, 100) <= location.opponentpct) {
    opponent = await NewOpponent(prng, location.level, location.theme);
  }

  return {
    prng: prng,
    location: location,
    intro: true,
    player: player,
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
      player: { ...scene.player, handSize: (scene.player.handSize += 1) },
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

export function GetConnectedScenes(scene: Scene): Location[] {
  let res: Location[] = [];
  for (const title of scene.location.connections) {
    const location = locations.get(title);
    if (location) {
      res.push(location);
    }
  }
  return res;
}

export async function ChooseConnection(
  scene: Scene,
  key: string,
): Promise<Scene> {
  return await NewScene(scene.prng, scene.player, key);
}

//location where a scene can occur
//level and theme used to guide opponent and loot selection
export interface Location {
  title: string;
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

//One could imagine this being in the database, naturally
//However it is here in the source code, unnaturally
const locations = new Map<string, Location>(
  [
    {
      title: "Welcome",
      image: "field.jpg",
      level: 1,
      theme: "outside",
      lootpct: 0,
      opponentpct: 0,
      connections: ["Meadow"],
    },

    {
      title: "Meadow",
      image: "meadow.jpg",

      level: 1,
      theme: "outside",

      lootpct: 100,
      opponentpct: 0,

      connections: ["Forest Path", "Cave Entrance"],
    },

    {
      title: "Forest Path",
      image: "forest-path.jpg",

      level: 1,
      theme: "outside",

      lootpct: 30,
      opponentpct: 75,

      connections: ["Forest River", "Forest Steps"],
    },

    {
      title: "Forest River",
      image: "forest-river.jpg",

      level: 1,
      theme: "outside",

      lootpct: 30,
      opponentpct: 75,

      connections: ["Forest Riverbed"],
    },

    {
      title: "Forest Riverbed",
      image: "forest-riverbed.jpg",

      level: 2,
      theme: "water",

      lootpct: 30,
      opponentpct: 75,

      connections: ["Oyster Mouth"],
    },

    {
      title: "Oyster Mouth",
      image: "oyster-mouth.jpg",

      level: 3,
      theme: "water",

      lootpct: 100,
      opponentpct: 100,

      connections: ["Bright Forest Path"],
    },

    {
      title: "Forest Steps",
      image: "forest-steps.jpg",

      level: 1,
      theme: "outside",

      lootpct: 30,
      opponentpct: 75,

      connections: ["Cottage Entrance"],
    },

    {
      title: "Cottage Entrance",
      image: "cottage-entrance.jpg",

      level: 2,
      theme: "outside",

      lootpct: 30,
      opponentpct: 75,

      connections: ["Cottage"],
    },

    {
      title: "Cottage",
      image: "cottage-interior.jpg",

      level: 3,
      theme: "witch",

      lootpct: 100,
      opponentpct: 100,

      connections: ["Bright Forest Path"],
    },

    {
      title: "Bright Forest Path",
      image: "forest-bright.jpg",

      level: 2,
      theme: "outside",

      lootpct: 30,
      opponentpct: 75,

      connections: ["Castle Entrance"],
    },

    {
      title: "Cave Entrance",
      image: "cave-entrance.jpg",

      level: 1,
      theme: "underground",

      lootpct: 35,
      opponentpct: 75,

      connections: ["Forest Path", "Cave"],
    },

    {
      title: "Cave",
      image: "cave-inside.jpg",

      level: 2,
      theme: "underground",

      lootpct: 35,
      opponentpct: 75,

      connections: ["Cave River", "Cave Camp"],
    },

    {
      title: "Cave River",
      image: "cave-river.jpg",

      level: 2,
      theme: "underground",

      lootpct: 35,
      opponentpct: 75,

      connections: ["Cave Camp", "Cave Exit"],
    },

    {
      title: "Cave Camp",
      image: "cave-camp.jpg",

      level: 3,
      theme: "underground",

      lootpct: 85,
      opponentpct: 90,

      connections: ["Cave Exit"],
    },

    {
      title: "Cave Exit",
      image: "cave-exit.jpg",

      level: 3,
      theme: "underground",

      lootpct: 25,
      opponentpct: 50,

      connections: ["Castle Entrance"],
    },

    {
      title: "Castle Entrance",
      image: "castle-entrance.jpg",

      level: 3,
      theme: "castle",

      lootpct: 25,
      opponentpct: 60,

      connections: ["Castle Room"],
    },

    {
      title: "Castle Room",
      image: "castle-room.jpg",

      level: 4,
      theme: "castle",

      lootpct: 25,
      opponentpct: 75,

      connections: ["Castle Sitting Room", "Castle Dining Hall"],
    },

    {
      title: "Castle Sitting Room",
      image: "castle-sitting-room.jpg",

      level: 4,
      theme: "castle",

      lootpct: 25,
      opponentpct: 75,

      connections: ["Castle Throne"],
    },

    {
      title: "Castle Dining Hall",
      image: "castle-dining-hall.jpg",

      level: 4,
      theme: "castle",

      lootpct: 25,
      opponentpct: 75,

      connections: ["Castle Throne"],
    },

    {
      title: "Castle Throne",
      image: "castle-throne.jpg",

      level: 5,
      theme: "castle",

      lootpct: 100,
      opponentpct: 100,

      connections: ["Castle Garden"],
    },

    {
      title: "Castle Garden",
      image: "castle-garden.jpg",

      level: 4,
      theme: "castle",

      lootpct: 75,
      opponentpct: 50,

      connections: ["Sewer Entrance"],
    },

    {
      title: "Sewer Entrance",
      image: "sewer-entrance.jpg",

      level: 5,
      theme: "sewer",

      lootpct: 55,
      opponentpct: 60,

      connections: ["Sewer Tunnel"],
    },
  ].map((location) => [location.title, location]),
);
