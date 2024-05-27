import type { Letter } from "./letter";
import { ScrabbleDistribution } from "./letter";

import type { ScoredWord } from "./util";
import type { BonusCard } from "./bonus";
import type { AbilityCard } from "./ability";

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
    bag: ScrabbleDistribution(),
    hyperbank: [],
    wordbank: [],
    abilities: new Map<string, AbilityCard>(),
    bonuses: new Map<string, BonusCard>(),
  };
}
