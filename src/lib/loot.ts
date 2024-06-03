//loot
// A treasure chest, perhaps

import type { Letter } from "./letter";
import { ScrabbleDistribution } from "./letter";

import type { AbilityCard } from "./ability";
import { AbilityCards } from "./ability";

import type { BonusCard } from "./bonus";
import { BonusCards } from "./bonus";

import type { Wordpack } from "./wordpack";
import { NewWordpack } from "./wordpack";

import type { Opponent } from "./opponent";

import type { PRNG } from "./util";
import { Shuffle, PickRandom } from "./util";

export type LootItem = AbilityLoot | BonusLoot | WordpackLoot | LetterLoot;
export interface AbilityLoot {
  type: "ability";
  item: AbilityCard;
}
export interface BonusLoot {
  type: "bonus";
  item: BonusCard;
}
export interface WordpackLoot {
  type: "wordpack";
  item: Wordpack;
}
export interface LetterLoot {
  type: "letters";
  item: Letter[];
}

export interface LootContainer {
  image: string;
  contents: LootItem[];
}

export function FirstLootContainer(): LootContainer {
  return {
    image: "bag.jpg",
    contents: [{ type: "letters", item: ScrabbleDistribution() }],
  };
}

export async function NewLootContainer(
  prng: PRNG,
  level: number,
): Promise<LootContainer> {
  let container = basicLootContainer(level);

  const randresult = prng(1, 2);

  if (randresult === 1) {
    const boost = Math.round(level / 4);
    for (const [k, v] of PickRandom(prng, AbilityCards, 1)) {
      container.contents.push({
        type: "ability",
        item: { ...v, uses: v.uses + boost },
      });
    }
  } else if (randresult === 2) {
    //Bonus
    for (const [k, v] of PickRandom(prng, BonusCards, 1)) {
      const boost = Math.round(level / 2);
      container.contents.push({
        type: "bonus",
        item: { ...v, level: v.level + boost },
      });
    }
  }

  return container;
}

export async function NewBattleLootContainer(
  prng: PRNG,
  opponent: Opponent,
): Promise<LootContainer> {
  let container = battleLootContainer(opponent.level);

  if (prng(0, 1) === 1) {
    const pack = await NewWordpack(opponent.level);
    container.contents.push({ type: "wordpack", item: pack });
  }

  if (container.contents.length === 0 || prng(0, 1) === 1) {
    const letters = Shuffle(prng, ScrabbleDistribution())
      .slice(0, prng(3, 10))
      .map((letter) => ({ ...letter, level: opponent.level }));
    container.contents.push({ type: "letters", item: letters });
  }

  return container;
}

function basicLootContainer(level: number): LootContainer {
  const idx = Math.min(Math.max(0, level - 1), basicContainers.length - 1);
  return {
    image: basicContainers[idx],
    contents: [],
  };
}

function battleLootContainer(level: number): LootContainer {
  const idx = Math.min(Math.max(0, level - 1), battleContainers.length - 1);
  return {
    image: battleContainers[idx],
    contents: [],
  };
}

const basicContainers = [
  "small-box.jpg",
  "simple-box.jpg",
  "small-chest.jpg",
  "rusty-chest.jpg",
  "nice-chest.jpg",
  "grand-treasure.jpg",
];

const battleContainers = [
  "pouch.jpg",
  "sack.jpg",
  "big-pack.jpg",
  "sparkly-pack.jpg",
  "backpack.jpg",
];
