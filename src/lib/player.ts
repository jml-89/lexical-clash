import type { Letter } from "./letter";
import type { BonusCard } from "./bonus";
import type { AbilityCard } from "./ability";
import type { LootContainer } from "./loot";

export interface Player {
  level: number;
  handSize: number;
  bag: Letter[];

  // A collection of hypernyms added from boosters
  hyperbank: string[];

  // A collection of words played
  wordbank: string[];

  abilities: Map<string, AbilityCard>;
  bonuses: Map<string, BonusCard>;
}

export function NewPlayer(): Player {
  return {
    level: 1,
    handSize: 9,
    bag: [],
    hyperbank: [],
    wordbank: [],
    abilities: new Map<string, AbilityCard>(),
    bonuses: new Map<string, BonusCard>(),
  };
}

//Takes 1 (one) item from a loot container
export function ClaimLootItem(
  player: Player,
  loot: LootContainer,
): [Player, LootContainer] {
  for (const ability of loot.abilities) {
    const x = player.abilities.get(ability.key);
    player.abilities.set(
      ability.key,
      x ? { ...x, uses: x.uses + 1 } : { ...ability },
    );
    return [{ ...player }, { ...loot, abilities: loot.abilities.slice(1) }];
  }

  for (const bonus of loot.bonuses) {
    const x = player.bonuses.get(bonus.key);
    player.bonuses.set(
      bonus.key,
      x ? { ...x, level: x.level + 1 } : { ...bonus },
    );
    return [{ ...player }, { ...loot, bonuses: loot.bonuses.slice(1) }];
  }

  for (const hyper of loot.hypers) {
    if (player.hyperbank.some((x) => x === hyper.hypernym)) {
      return [player, { ...loot, hypers: loot.hypers.slice(1) }];
    }

    player.hyperbank.push(hyper.hypernym);
    return [{ ...player }, { ...loot, hypers: loot.hypers.slice(1) }];
  }

  if (loot.letters.length > 0) {
    return [
      { ...player, bag: [...player.bag, ...loot.letters] },
      { ...loot, letters: [] },
    ];
  }

  return [player, loot];
}
