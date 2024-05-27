//loot
// A treasure chest, perhaps

import type { AbilityCard } from "./ability";
import { AbilityCards } from "./ability";

import type { BonusCard } from "./bonus";
import { BonusCards } from "./bonus";

import type { ServerFunctions } from "./wordnet";
import type { PRNG, HyperSet } from "./util";
import { PickRandom } from "./util";

export interface LootContainer {
  title: string;
  desc: string;
  image: string;

  abilities: AbilityCard[];
  bonuses: BonusCard[];
  words: HyperSet[];
}

// Returns a loot container of specified level with random contents
export async function NewLootContainer(
  sf: ServerFunctions,
  prng: PRNG,
  level: number,
): Promise<LootContainer> {
  let container = basicLootContainer(level);

  for (let i = 0; i < level; i++) {
    const randresult = prng(0, 3);

    if (randresult === 0) {
      // Ability
      for (const [k, v] of PickRandom(prng, AbilityCards, 1)) {
        container.abilities.push(v);
      }
    } else if (randresult === 1) {
      // Bonus
      for (const [k, v] of PickRandom(prng, BonusCards, 1)) {
        container.bonuses.push(v);
      }
    } else if (randresult === 2) {
      // HyperSet (word pack)
      const hypers = await sf.candidates(level * 200, (level + 1) * 300, 10, 1);
      for (const hyper of hypers) {
        container.words.push(hyper);
      }
    }
  }

  return container;
}

function basicLootContainer(level: number): LootContainer {
  const gen = (title: string, desc: string, image: string): LootContainer => ({
    title: title,
    desc: desc,
    image: image,

    abilities: [],
    bonuses: [],
    words: [],
  });

  switch (Math.round(level)) {
    case 1:
      return gen("Small Wooden Box", "An inconspicuous box", "public/box.jpg");
    case 2:
      return gen("Rusty Chest", "An old worn chest", "public/chest.jpg");
    case 3:
      return gen(
        "Grand Treasure Chest",
        "A gilded find!",
        "public/treasure.jpg",
      );
    default:
      return gen("NoTitle", "NoDesc", "NoImage");
  }
}
