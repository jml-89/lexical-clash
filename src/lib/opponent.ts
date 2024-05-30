//opponent
// Really should be called profile at this point
// Not a whole lot to say other than it's hardcoded and shouldn't be

import type { PRNG } from "./util";
import { Shuffle } from "./util";

export interface Opponent {
  name: string;
  memberof: string;
  level: number;
  theme: string;
  weakness: string;
  strength: string;
  image: string;
}

interface OpponentSet {
  name: string;
  theme: string;
  weakness: string;
  strength: string;
  drafts: OpponentDraft[];
}

interface OpponentDraft {
  name: string;
  image: string;
}

//Select the most dangerous possible opponent for a given area
export async function NewOpponent(
  prng: PRNG,
  level: number,
  theme: string,
): Promise<Opponent> {
  let idx = opponents.findIndex((set) => set.theme === theme);
  if (idx === -1) {
    if (theme === "all") {
      throw `No theme found`;
    }
    return await NewOpponent(prng, level, "all");
  }

  const li = Math.max(0, level - 1);
  if (li >= opponents[idx].drafts.length) {
    if (theme === "all") {
      throw `No opponent found for ${level}`;
    }
    return await NewOpponent(prng, level, "all");
  }

  return AwakenOpponent(opponents[idx], li);
}

function AwakenOpponent(set: OpponentSet, idx: number): Opponent {
  return {
    ...set.drafts[idx], //name, image
    memberof: set.name,
    theme: set.theme,
    strength: set.strength,
    weakness: set.weakness,
    level: idx + 1,
  };
}

const opponents = [
  {
    name: "Rodent",
    theme: "all",
    strength: "fauna",
    weakness: "flora",
    drafts: [
      { name: "Mouse", image: "mouse.jpg" },
      { name: "Rat", image: "rat.jpg" },
      { name: "Giant Rat", image: "giant-rat.jpg" },
      { name: "Giant Rat", image: "giant-rat.jpg" },
      { name: "Giant Rat", image: "giant-rat.jpg" },
      { name: "Giant Rat", image: "giant-rat.jpg" },
      { name: "Wombat", image: "wombat.jpg" },
    ],
  },
  {
    name: "Friendly? Animal",
    theme: "outside",
    strength: "fauna",
    weakness: "flora",
    drafts: [
      { name: "Dog", image: "dog.jpg" },
      { name: "Cat", image: "cat.jpg" },
      { name: "Bee", image: "bee.jpg" },
      { name: "Bee", image: "bee.jpg" },
      { name: "Kookaburra", image: "kookaburra.jpg" },
    ],
  },

  {
    name: "Creepy Crawly",
    theme: "underground",
    strength: "bailiwick",
    weakness: "feeling",
    drafts: [
      { name: "Ant", image: "ant.jpg" },
      { name: "Millipede", image: "millipede.jpg" },
      { name: "Centipede", image: "centipede.jpg" },
      { name: "Scarab", image: "scarab.jpg" },
      { name: "Scarab", image: "scarab.jpg" },
    ],
  },

  {
    name: "Aquatic Creature",
    theme: "water",
    strength: "fish",
    weakness: "weather",
    drafts: [
      { name: "Frog", image: "frog.jpg" },
      { name: "Fish", image: "fish.jpg" },
      { name: "Octopus", image: "octopus.jpg" },
      { name: "Octopus", image: "octopus.jpg" },
      { name: "Octopus", image: "octopus.jpg" },
      { name: "Octopus", image: "octopus.jpg" },
    ],
  },

  {
    name: "Villain",
    theme: "castle",
    strength: "disease",
    weakness: "color",
    drafts: [
      { name: "Philosopher", image: "philo.jpg" },
      { name: "Philosopher", image: "philo.jpg" },
      { name: "Philosopher", image: "philo.jpg" },
      { name: "Plague Doctor", image: "plaguedoctor.jpg" },
      { name: "Witch", image: "witch.jpg" },
      { name: "Vampire", image: "vamp.jpg" },
    ],
  },

  {
    name: "Machine",
    theme: "urban",
    strength: "machine",
    weakness: "nature",
    drafts: [
      { name: "Automaton", image: "robot.jpg" },
      { name: "Automaton", image: "robot.jpg" },
      { name: "Automaton", image: "robot.jpg" },
      { name: "Locomotive", image: "train.jpg" },
      { name: "Locomotive", image: "train.jpg" },
    ],
  },

  {
    name: "Dinosaur",
    theme: "jungle",
    strength: "herb",
    weakness: "metal",
    drafts: [
      { name: "Tea Rex", image: "dinosaur.jpg" },
      { name: "Tea Rex", image: "dinosaur.jpg" },
      { name: "Tea Rex", image: "dinosaur.jpg" },
      { name: "Tea Rex", image: "dinosaur.jpg" },
      { name: "Tea Rex", image: "dinosaur.jpg" },
    ],
  },
];
