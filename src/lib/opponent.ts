//opponent
// Really should be called profile at this point
// Not a whole lot to say other than it's hardcoded and shouldn't be

import type { ServerFunctions } from "./wordnet";
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

export const PlayerProfile = {
  name: "Player",
  desc: "Gamer Neckus",
  themes: ["all"],
  level: 1,
  weakness: [],
  strength: [],
  image: "portrait/dark/frog.jpg",
};

export async function NewOpponent(
  sf: ServerFunctions,
  prng: PRNG,
  level: number,
  theme: string,
): Promise<Opponent> {
  const isCandidate = (o: Opponent) => isThematic(o, theme) && o.level <= level;

  const candidates = Shuffle(prng, [...opponents.values()].filter(isCandidate));
  return candidates[0];
}

function isThematic(opponent: Opponent, theme: string): boolean {
  return opponent.themes.findIndex((s) => s === "all" || s === theme) >= 0;
}

const opponents = new Map<string, Opponent>([
  [
    "dog",
    {
      name: "Dog",
      desc: "Canis Familiaris",
      image: "portrait/dark/dog.jpg",

      level: 1,
      themes: ["outside"],

      weakness: ["food"],
      strength: ["food"],
    },
  ],

  [
    "cat",
    {
      name: "Cat",
      desc: "Felinus Scratchus",
      level: 1,
      themes: ["outside"],
      weakness: ["flora"],
      strength: ["fauna"],
      image: "portrait/dark/cat.jpg",
    },
  ],

  [
    "fish",
    {
      name: "Fish",
      desc: "Splishus Splashus",
      level: 1,
      themes: ["water"],
      weakness: ["tool"],
      strength: ["malacopterygian"],
      image: "portrait/dark/fish.jpg",
    },
  ],

  [
    "rat",
    {
      name: "Rat",
      desc: "Gnawus Allus",
      level: 2,
      themes: ["all"],
      weakness: ["game"],
      strength: ["body"],
      image: "portrait/dark/rat.jpg",
    },
  ],

  [
    "bee",
    {
      name: "Bee",
      desc: "buzz buzz",
      level: 2,
      themes: ["outside"],
      weakness: ["chemical"],
      strength: ["insect"],
      image: "portrait/dark/bee.jpg",
    },
  ],
  [
    "octopus",
    {
      name: "Octopus",
      desc: "Extra-Aquatical",
      level: 2,
      themes: ["water"],
      weakness: ["weather"],
      strength: ["number"],
      image: "portrait/dark/octopus.jpg",
    },
  ],

  [
    "vampire",
    {
      name: "Vampire",
      desc: "Ah ah ah!",
      level: 3,
      themes: ["castle"],
      weakness: ["mineral"],
      strength: ["misconduct"],
      image: "portrait/dark/vamp.jpg",
    },
  ],

  [
    "philosopher",
    {
      name: "Philosopher",
      desc: "Nerdus Wordus",
      level: 3,
      themes: ["castle"],
      weakness: ["color"],
      strength: ["time"],
      image: "portrait/dark/philo.jpg",
    },
  ],

  [
    "robot",
    {
      name: "Automaton",
      desc: "Beepus Boopus",
      level: 3,
      themes: ["castle"],
      weakness: ["water"],
      strength: ["machine"],
      image: "portrait/dark/robot.jpg",
    },
  ],

  [
    "kookaburra",
    {
      name: "Kookaburra",
      desc: "Laughus Laughus",
      level: 4,
      themes: ["outside"],
      weakness: ["herb"],
      strength: ["bird"],
      image: "portrait/dark/kookaburra.jpg",
    },
  ],

  [
    "cloud",
    {
      name: "Cloud",
      desc: "Fluffus Fluffy",
      level: 4,
      themes: ["outside"],
      weakness: ["measure"],
      strength: ["weather"],
      image: "portrait/dark/cloud.jpg",
    },
  ],

  [
    "dinosaur",
    {
      name: "Tea Rex",
      desc: "Herbus Sippus",
      level: 5,
      themes: ["all"],
      weakness: ["kindle"],
      strength: ["herb"],
      image: "portrait/dark/dinosaur.jpg",
    },
  ],

  [
    "train",
    {
      name: "Locomotive",
      desc: "Steamus Pistonus",
      level: 5,
      themes: ["outside"],
      weakness: ["nature"],
      strength: ["transport"],
      image: "portrait/dark/train.jpg",
    },
  ],

  [
    "plaguedoctor",
    {
      name: "Plague Doctor",
      desc: "One Sick Bird",
      level: 6,
      themes: ["castle"],
      weakness: ["technology"],
      strength: ["disease"],
      image: "portrait/dark/plaguedoctor.jpg",
    },
  ],

  [
    "wombat",
    {
      name: "Boss Wombat",
      desc: "The End",
      level: 7,
      themes: ["all"],
      weakness: [""],
      strength: ["noesis"],
      image: "portrait/dark/wombat.jpg",
    },
  ],
]);
