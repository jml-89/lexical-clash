//opponent
// Really should be called profile at this point
// Not a whole lot to say other than it's hardcoded and shouldn't be

import type { PRNG } from "./util";
import { Shuffle } from "./util";

export interface Opponent {
  name: string;
  desc: string;
  level: number;
  themes: string[];
  weakness: string[];
  strength: string[];
  image: string;
}

//Select the most dangerous possible opponent for a given area
export async function NewOpponent(
  prng: PRNG,
  level: number,
  theme: string,
): Promise<Opponent> {
  const isCandidate = (o: Opponent) => isThematic(o, theme) && o.level <= level;
  let candidates = opponents.filter(isCandidate);
  const bestLevel = candidates.reduce(
    (acc, cur) => (acc > cur.level ? acc : cur.level),
    0,
  );
  candidates = candidates.filter((o) => o.level === bestLevel);

  return Shuffle(prng, candidates)[0];
}

function isThematic(opponent: Opponent, theme: string): boolean {
  return opponent.themes.findIndex((s) => s === "all" || s === theme) >= 0;
}

const opponents = [
  {
    name: "Mouse",
    desc: "Squeakus Meekus",
    level: 1,
    themes: ["all"],
    weakness: ["flora"],
    strength: ["fauna"],
    image: "mouse.jpg",
  },
  {
    name: "Rat",
    desc: "Gnawus Allus",
    level: 2,
    themes: ["all"],
    weakness: ["flora"],
    strength: ["fauna"],
    image: "rat.jpg",
  },
  {
    name: "Giant Rat",
    desc: "Chompus Chompus",
    level: 3,
    themes: ["all"],
    weakness: ["flora"],
    strength: ["fauna"],
    image: "giant-rat.jpg",
  },

  {
    name: "Dog",
    desc: "Canis Familiaris",
    image: "dog.jpg",
    level: 1,
    themes: ["outside"],
    weakness: ["food"],
    strength: ["food"],
  },
  {
    name: "Cat",
    desc: "Felinus Scratchus",
    level: 2,
    themes: ["outside"],
    weakness: ["flora"],
    strength: ["fauna"],
    image: "cat.jpg",
  },
  {
    name: "Bee",
    desc: "buzz buzz",
    level: 3,
    themes: ["outside"],
    weakness: ["chemical"],
    strength: ["insect"],
    image: "bee.jpg",
  },
  {
    name: "Kookaburra",
    desc: "Laughus Laughus",
    level: 4,
    themes: ["outside"],
    weakness: ["herb"],
    strength: ["bird"],
    image: "kookaburra.jpg",
  },

  {
    name: "Centipede",
    desc: "Hundred Feet",
    level: 3,
    themes: ["underground"],
    weakness: ["sun"],
    strength: ["insect"],
    image: "centipede.jpg",
  },

  {
    name: "Fish",
    desc: "Splishus Splashus",
    level: 1,
    themes: ["water"],
    weakness: ["tool"],
    strength: ["malacopterygian"],
    image: "fish.jpg",
  },
  {
    name: "Frog",
    desc: "Ribbit!",
    level: 2,
    themes: ["water"],
    weakness: ["flora"],
    strength: ["chordate"],
    image: "frog.jpg",
  },
  {
    name: "Octopus",
    desc: "Extra-Aquatical",
    level: 3,
    themes: ["water"],
    weakness: ["weather"],
    strength: ["number"],
    image: "octopus.jpg",
  },

  {
    name: "Philosopher",
    desc: "Nerdus Wordus",
    level: 2,
    themes: ["castle"],
    weakness: ["color"],
    strength: ["time"],
    image: "philo.jpg",
  },
  {
    name: "Vampire",
    desc: "Ah ah ah!",
    level: 3,
    themes: ["castle"],
    weakness: ["mineral"],
    strength: ["misconduct"],
    image: "vamp.jpg",
  },
  {
    name: "Automaton",
    desc: "Beepus Boopus",
    level: 3,
    themes: ["urban"],
    weakness: ["water"],
    strength: ["machine"],
    image: "robot.jpg",
  },
  {
    name: "Locomotive",
    desc: "Steamus Pistonus",
    level: 5,
    themes: ["urban"],
    weakness: ["nature"],
    strength: ["transport"],
    image: "train.jpg",
  },
  {
    name: "Plague Doctor",
    desc: "One Sick Bird",
    level: 6,
    themes: ["urban"],
    weakness: ["technology"],
    strength: ["disease"],
    image: "plaguedoctor.jpg",
  },
  {
    name: "Cloud",
    desc: "Fluffus Fluffy",
    level: 4,
    themes: ["outside"],
    weakness: ["measure"],
    strength: ["weather"],
    image: "cloud.jpg",
  },
  {
    name: "Tea Rex",
    desc: "Herbus Sippus",
    level: 5,
    themes: ["jungle"],
    weakness: ["kindle"],
    strength: ["herb"],
    image: "dinosaur.jpg",
  },
  {
    name: "Boss Wombat",
    desc: "The End",
    level: 7,
    themes: ["all"],
    weakness: [""],
    strength: ["noesis"],
    image: "wombat.jpg",
  },
  {
    name: "Witch",
    desc: "Cottage Dweller",
    level: 3,
    themes: ["witch"],
    weakness: ["health"],
    strength: ["flora"],
    image: "witch.jpg",
  },
];

const opponentLookup = new Map<string, Opponent>(
  opponents.map((opponent) => [opponent.name, opponent]),
);
