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
  title: string;
  desc: string;
  image: string;

  contents: LootItem[];
}

export function FirstLootContainer(): LootContainer {
  return {
    title: "Tattered Bag",
    desc: "A strange bag overflowing with letters",
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
    ? battleLootContainer(level - 1)
    : basicLootContainer(level - 1);

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
            score: letter.score + level,
            level: letter.level + level,
          })),
      });
    }
  }

  return container;
}

function basicLootContainer(level: number): LootContainer {
  return {
    ...basicContainers[Math.min(level, basicContainers.length - 1)],
    contents: [],
  };
}

function battleLootContainer(level: number): LootContainer {
  return {
    ...battleContainers[Math.min(level, battleContainers.length - 1)],
    contents: [],
  };
}

const basicContainers = [
  {
    title: "Small Wooden Box",
    desc: "An inconspicuous box",
    image: "small-box.jpg",
    contents: [],
  },
  {
    title: "Simple Box",
    desc: "",
    image: "simple-box.jpg",
    contents: [],
  },
  {
    title: "Wooden Chest",
    desc: "",
    image: "small-chest.jpg",
    contents: [],
  },
  {
    title: "Rusty Chest",
    desc: "An old worn chest",
    image: "rusty-chest.jpg",
    contents: [],
  },
  {
    title: "Nice Chest",
    desc: "",
    image: "nice-chest.jpg",
    contents: [],
  },
  {
    title: "Grand Treasure Chest",
    desc: "A gilded find!",
    image: "grand-treasure.jpg",
    contents: [],
  },
];

const battleContainers = [
  {
    title: "Rogue's Pouch",
    desc: "Surely nothing of value contained within",
    image: "pouch.jpg",
    contents: [],
  },
  {
    title: "Thief's Pack",
    desc: "Stolen or not, the contents are yours now",
    image: "sack.jpg",
    contents: [],
  },
  {
    title: "Warrior's Pack",
    desc: "",
    image: "big-pack.jpg",
    contents: [],
  },
  {
    title: "Wizard's Pack",
    desc: "",
    image: "sparkly-pack.jpg",
    contents: [],
  },
  {
    title: "Villain's Backpack",
    desc: "Overflowing with evil!",
    image: "backpack.jpg",
    contents: [],
  },
];
