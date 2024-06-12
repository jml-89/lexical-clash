//opponent
// Really should be called profile at this point
// Not a whole lot to say other than it's hardcoded and shouldn't be

import type { PRNG } from "./util";
import { Shuffle } from "./util";

export interface Opponent {
  name: string;
  memberof: string;
  level: number;
  region: string;
  weakness: string;
  strength: string;
  image: string;
}

interface Gang {
  name: string;
  region: string;
  weakness: string;
  strength: string;
  members: GangMember[];
  boss: GangMember;
}

interface GangMember {
  name: string;
  image: string;
}

export async function NewBoss(
  region: string,
  level: number,
): Promise<Opponent> {
  let gang = gangs.find((gang) => gang.region === region);
  if (!gang) {
    gang = gangs[0];
  }

  return {
    ...gang.boss, //name, image
    memberof: gang.name,
    region: gang.region,
    strength: gang.strength,
    weakness: gang.weakness,
    level: level,
  };
}

//Select the most dangerous possible opponent for a given area
export async function NewOpponent(
  prng: PRNG,
  region: string,
  minLevel: number,
  maxLevel: number,
): Promise<Opponent> {
  let gang = gangs.find((gang) => gang.region === region);
  if (!gang) {
    gang = gangs[0];
  }

  const level = prng(minLevel, maxLevel);
  const idx = prng(0, gang.members.length - 1);

  return {
    ...gang.members[idx], //name, image
    memberof: gang.name,
    region: gang.region,
    strength: gang.strength,
    weakness: gang.weakness,
    level: level,
  };
}

const gangs = [
  {
    name: "Rodent",
    region: "all",
    strength: "fauna",
    weakness: "flora",
    members: [
      { name: "Mouse", image: "mouse.jpg" },
      { name: "Rat", image: "rat.jpg" },
      { name: "Giant Rat", image: "giant-rat.jpg" },
    ],
    boss: { name: "Wombat", image: "wombat.jpg" },
  },
  {
    name: "Friendly Animal",
    region: "Forest",
    strength: "fauna",
    weakness: "flora",
    members: [
      { name: "Dog", image: "dog.jpg" },
      { name: "Dog", image: "dog-2.jpg" },
      { name: "Dog", image: "dog-3.jpg" },
      { name: "Cat", image: "cat.jpg" },
      { name: "Bee", image: "bee.jpg" },
    ],
    boss: { name: "Kookaburra", image: "kookaburra.jpg" },
  },

  {
    name: "Creepy Crawly",
    region: "Cave",
    strength: "bailiwick",
    weakness: "feeling",
    members: [
      { name: "Ant", image: "ant.jpg" },
      { name: "Moth", image: "moth-1.jpg" },
      { name: "Moth", image: "moth-2.jpg" },
      { name: "Moth", image: "moth-3.jpg" },
      { name: "Millipede", image: "millipede.jpg" },
      { name: "Centipede", image: "centipede.jpg" },
    ],
    boss: { name: "Scarab", image: "scarab.jpg" },
  },

  {
    name: "Mutant",
    region: "Sewer",
    strength: "activity",
    weakness: "material",
    members: [
      { name: "Turtle", image: "turtle.jpg" },
      { name: "Crocodile", image: "croc.jpg" },
      { name: "Goldfish", image: "goldfish.jpg" },
    ],
    boss: { name: "Alligator", image: "alligator.jpg" },
  },

  {
    name: "Aquatic Creature",
    region: "Sea",
    strength: "fish",
    weakness: "weather",
    members: [
      { name: "Frog", image: "frog.jpg" },
      { name: "Fish", image: "fish.jpg" },
    ],
    boss: { name: "Octopus", image: "octopus.jpg" },
  },

  {
    name: "Villain",
    region: "Castle",
    strength: "disease",
    weakness: "color",
    members: [
      { name: "Philosopher", image: "philo.jpg" },
      { name: "Plague Doctor", image: "plaguedoctor.jpg" },
      { name: "Witch", image: "witch.jpg" },
    ],
    boss: { name: "Vampire", image: "vamp.jpg" },
  },

  {
    name: "Magical Creature",
    region: "Mushroom Forest",
    strength: "drug",
    weakness: "good",
    members: [
      { name: "Gnome", image: "gnome-1.jpg" },
      { name: "Gnome", image: "gnome-2.jpg" },
      { name: "Goblin", image: "goblin.jpg" },
      { name: "Fairy", image: "fairy.jpg" },
    ],
    boss: { name: "Elf", image: "elf.jpg" },
  },

  {
    name: "Machine",
    region: "City",
    strength: "machine",
    weakness: "nature",
    members: [
      { name: "Automobile", image: "car-1.jpg" },
      { name: "Automotive", image: "car-2.jpg" },
      { name: "Automaton", image: "robot.jpg" },
    ],
    boss: { name: "Locomotive", image: "train.jpg" },
  },

  {
    name: "Dinosaur",
    region: "Jungle",
    strength: "herb",
    weakness: "metal",
    members: [
      { name: "Allosaurus", image: "allosaurus.jpg" },
      { name: "Iguanodon", image: "iguanodon.jpg" },
      { name: "Pterosaur", image: "pterosaur.jpg" },
    ],
    boss: { name: "Tea Rex", image: "dinosaur.jpg" },
  },
];
