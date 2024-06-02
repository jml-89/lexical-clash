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

// Returns a loot container of specified level with random contents
export async function NewLootContainer(
  prng: PRNG,
  level: number,
  battle: boolean,
): Promise<LootContainer> {
  let container = battle
    ? battleLootContainer(level)
    : basicLootContainer(level);

  for (let i = 0; i < level; i++) {
    const randresult = prng(0, 100);

    if (randresult < 10) {
      //Ability
      for (const [k, v] of PickRandom(prng, AbilityCards, 1)) {
        container.contents.push({
          type: "ability",
          item: v,
        });
      }
    } else if (randresult < 30) {
      //Bonus
      for (const [k, v] of PickRandom(prng, BonusCards, 1)) {
        container.contents.push({
          type: "bonus",
          item: v,
        });
      }
    } else if (randresult < 60) {
      //Wordpack
      const pack = await NewWordpack(level);
      container.contents.push({
        type: "wordpack",
        item: pack,
      });
    } else {
      container.contents.push({
        type: "letters",
        item: Shuffle(prng, ScrabbleDistribution())
          .slice(0, prng(1, 10))
          .map((letter) => ({
            ...letter,
            level: letter.level + level,
          })),
      });
    }
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
