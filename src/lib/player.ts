import type { Letter } from "./letter";
import type { BonusCard } from "./bonus";
import type { AbilityCard } from "./ability";
import type { Wordpack } from "./wordpack";
import type { LootContainer } from "./loot";

export interface Player {
  level: number;
  handSize: number;
  bag: Letter[];

  abilities: Map<string, AbilityCard>;
  bonuses: Map<string, BonusCard>;
  wordpacks: Wordpack[];

  // A collection of words played
  wordbank: string[];
}

export function NewPlayer(): Player {
  return {
    level: 1,
    handSize: 9,
    bag: [],
    wordpacks: [],
    wordbank: [],
    abilities: new Map<string, AbilityCard>(),
    bonuses: new Map<string, BonusCard>(),
  };
}

export function LevelUp(player: Player): Player {
  return {
    ...player,
    level: player.level + 1,
    handSize: player.handSize + 1,
  };
}

function AddAbility(player: Player, ability: AbilityCard): Player {
  const x = player.abilities.get(ability.key);
  player.abilities.set(
    ability.key,
    x ? { ...x, uses: x.uses + 1 } : { ...ability },
  );
  return {
    ...player,
  };
}

function AddBonus(player: Player, bonus: BonusCard): Player {
  const x = player.bonuses.get(bonus.key);
  player.bonuses.set(
    bonus.key,
    x ? { ...x, level: x.level + 1 } : { ...bonus },
  );
  return {
    ...player,
  };
}

function AddWordpack(player: Player, wordpack: Wordpack): Player {
  if (player.wordpacks.some((x) => x.hypernym === wordpack.hypernym)) {
    return player;
  }

  return {
    ...player,
    wordpacks: [...player.wordpacks, wordpack],
  };
}

function AddLetters(player: Player, letters: Letter[]): Player {
  return {
    ...player,
    bag: [...player.bag, ...letters].map((letter, idx) => ({
      ...letter,
      id: `bag-${idx}`,
    })),
  };
}

//Takes 1 (one) item from a loot container
export function ClaimLootItem(
  player: Player,
  loot: LootContainer,
): [Player, LootContainer] {
  const next = loot.contents[0];
  const lessLoot = { ...loot, contents: loot.contents.slice(1) };
  switch (next.type) {
    case "ability":
      return [AddAbility(player, next.item), lessLoot];
    case "bonus":
      return [AddBonus(player, next.item), lessLoot];
    case "wordpack":
      return [AddWordpack(player, next.item), lessLoot];
    case "letters":
      return [AddLetters(player, next.item), lessLoot];
  }
}
