//battle
// The actual game!

"use client";

import {
  Letter,
  ScrabbleDistribution,
  lettersToString,
  stringToLetters,
  simpleScore,
} from "./letter";

import { PlayArea } from "./playarea";

import {
  Draw,
  PlaceById,
  PlaceWord,
  UnplaceLast,
  UnplaceAll,
  UnplaceById,
  DiscardAll,
} from "./playarea";

import { PlayerProfile, Opponent } from "./opponent";

import {
  AbilityCard,
  AbilityImpl,
  AbilityCards,
  AbilityImpls,
} from "./ability";

import { BonusCard, BonusCards } from "./bonus";

import { Scoresheet, ScoreWord } from "./score";

import {
  CopyMap,
  ScoredWord,
  KnowledgeBase,
  PRNG,
  ShuffleMap,
  Shuffle,
} from "./util";

export interface Battler {
  health: number;

  playArea: PlayArea;
  profile: Opponent;

  checking: boolean;
  scoresheet?: Scoresheet;
  wordbank: Map<string, ScoredWord>;

  abilities: Map<string, AbilityCard>;
  bonuses: Map<string, BonusCard>;

  wordMatches: string[];
}

export async function FillWordbank(
  lookup: (s: string) => Promise<ScoredWord[]>,
  o: Battler,
): Promise<ScoredWord[]> {
  let xs = [];
  for (const s of o.profile.strength) {
    for (const word of await lookup(s)) {
      xs.push(word);
    }
  }

  const minScore = 4 + 4 * (o.profile.level - 1);
  const maxScore = 9 + 5 * (o.profile.level - 1);
  const scoreInRange = (xs: ScoredWord): boolean => {
    return minScore <= xs.score && xs.score <= maxScore;
  };

  let ys = xs.filter(scoreInRange);

  // This happens when the level gets too high
  // This is a signal to just go huge, use best words
  if (ys.length < 10) {
    ys = xs.toSorted((a, b) => b.score - a.score).slice(0, 20);
  }

  return ys;
}

interface BattlerSetup {
  handSize: number;
  prng: PRNG;
  letters: Letter[];
  bonuses: Map<string, BonusCard>;
  abilities: Map<string, AbilityCard>;
  profile: Opponent;
}

function NewBattler(bs: BattlerSetup): Battler {
  return {
    health: bs.profile.healthMax,

    abilities: CopyMap(bs.abilities),
    bonuses: CopyMap(bs.bonuses),

    checking: false,
    scoresheet: undefined,
    wordMatches: [],

    profile: bs.profile,
    wordbank: new Map<string, ScoredWord>(),

    playArea: {
      prng: bs.prng,
      handSize: bs.handSize,
      bag: bs.letters,
      hand: [],
      placed: [],
    },
  };
}

export interface Battle {
  type: "battle";

  kb: KnowledgeBase;
  prng: PRNG;
  done: boolean;
  victory: boolean;

  round: number;

  player: Battler;
  opponent: Battler;
}

export interface BattleSetup {
  handSize: number;
  letters: Letter[];
  kb: KnowledgeBase;
  prng: PRNG;

  wordbank: Map<string, ScoredWord>;

  bonuses: Map<string, BonusCard>;
  abilities: Map<string, AbilityCard>;

  opponent: Opponent;
}

export async function NewBattle(bs: BattleSetup): Promise<Battle> {
  const battle: Battle = {
    ...bs,

    type: "battle",

    done: false,
    victory: false,

    round: 0,

    player: NewBattler({
      ...bs,
      profile: PlayerProfile,
    }),

    opponent: NewBattler({
      handSize: 9,
      prng: bs.prng,
      letters: bs.letters,
      bonuses: new Map<string, BonusCard>(),
      abilities: new Map<string, AbilityCard>(),
      profile: bs.opponent,
    }),
  };

  const words = await FillWordbank(battle.kb.hypos, battle.opponent);
  for (const word of words) {
    battle.opponent.wordbank.set(word.word, word);
  }

  battle.opponent.wordbank = ShuffleMap(battle.prng, battle.opponent.wordbank);
  battle.player.wordbank = bs.wordbank;

  await NextRound(battle);
  return battle;
}

function AbilityChecks(b: Battler): Battler {
  let upd = new Map<string, AbilityCard>();
  for (const [k, v] of b.abilities) {
    const impl = AbilityImpls.get(k);
    if (impl === undefined) {
      console.log(`No implementation found for bonus ${k}`);
      continue;
    }
    upd.set(k, {
      ...v,
      ok: v.uses > 0 && impl.pred(b.playArea),
    });
  }

  return {
    ...b,
    abilities: upd,
  };
}

function UseAbilityReal(g: Battler, key: string): Battler {
  const impl = AbilityImpls.get(key);
  if (impl === undefined) {
    console.log(`No implementation found for ability ${key}`);
    return g;
  }

  const ability = g.abilities.get(key);
  if (ability === undefined) {
    console.log(`No card found for ability ${key}`);
    return g;
  }

  let nextAbilities = new Map<string, AbilityCard>();
  for (const [k, v] of g.abilities) {
    if (k === key) {
      let x = { ...v };
      x.uses -= 1;
      nextAbilities.set(k, x);
    } else {
      nextAbilities.set(k, v);
    }
  }

  return AbilityChecks({
    ...g,
    playArea: impl.func(g.playArea),
    scoresheet: undefined,
    abilities: nextAbilities,
  });
}

export async function UseAbility(g: Battle, key: string): Promise<void> {
  g.player = UseAbilityReal(g.player, key);
  g.player.wordMatches = WordbankCheck(g.player);
}

// This function only uses the simple score of a word
// That is, its letter score
// No bonuses / weaknesses are included
// Doing the full server round trip for every word, no way
// There could be a server-side solution...
function WordbankCheck(g: Battler): string[] {
  const found: ScoredWord[] = [];

  let pm = new Map<string, number>();
  for (const letter of g.playArea.hand) {
    if (!letter) {
      continue;
    }

    const c = letter.char.toLowerCase();
    const n = pm.get(c);
    pm.set(c, n === undefined ? 1 : n + 1);
  }

  for (const letter of g.playArea.placed) {
    const c = letter.char.toLowerCase();
    const n = pm.get(c);
    pm.set(c, n === undefined ? 1 : n + 1);
  }

  for (const [str, scoredword] of g.wordbank) {
    let wm = new Map<string, number>();
    for (const c of scoredword.word) {
      const n = wm.get(c);
      wm.set(c, n === undefined ? 1 : n + 1);
    }

    let good = true;
    for (const [c, n] of wm) {
      const m = pm.get(c);
      good = good && m !== undefined && n <= m;
      if (!good) {
        break;
      }
    }

    if (good) {
      found.push(scoredword);
    }
  }

  found.sort((a, b) => b.score - a.score);
  return found.map((a) => a.word).slice(0, 15);
}

async function NextRound(g: Battle): Promise<void> {
  g.round = g.round + 1;

  g.player = { ...g.player };
  g.player.playArea = Draw(DiscardAll(g.player.playArea));
  g.player.wordMatches = WordbankCheck(g.player);
  g.player = AbilityChecks(g.player);
  g.player.scoresheet = await UpdateScore(g.player, g.opponent, g.kb);

  g.opponent = { ...g.opponent };
  g.opponent.playArea = Draw(DiscardAll(g.opponent.playArea));
  g.opponent.playArea.placed = await NextWord(g.opponent, g.round);
  g.opponent.scoresheet = await UpdateScore(g.opponent, g.player, g.kb);
}

async function NextWord(g: Battler, round: number): Promise<Letter[]> {
  let res: Letter[] = [];

  const keys = [...g.wordbank.keys()];
  const choice = g.wordbank.get(keys[round % keys.length]);
  if (choice !== undefined) {
    res = stringToLetters(choice.word, choice.word);
  }

  if (g.profile.level > 7) {
    const incr = Math.min(4, g.profile.level - 7);
    for (const c of res) {
      c.level += incr;
      c.score += incr;
    }
  }

  return res;
}

export async function Submit(g: Battle): Promise<void> {
  if (!(g.player.scoresheet && g.opponent.scoresheet)) {
    return;
  }

  const diff = g.player.scoresheet.score - g.opponent.scoresheet.score;
  if (diff > 0) {
    g.opponent = { ...g.opponent, health: g.opponent.health - diff };
  } else if (diff < 0) {
    g.player = { ...g.player, health: g.player.health + diff };
  }

  const str = lettersToString(g.player.playArea.placed);
  if (!g.player.wordbank.has(str)) {
    // This is a little goofy, but the player may have used enhanced letters
    // To get a "true" score, have to do this
    g.player.wordbank.set(str, {
      word: str,
      score: simpleScore(stringToLetters("tmp", str)),
    });
  }

  if (g.player.health <= 0) {
    g.victory = false;
    g.done = true;
    return;
  }

  if (g.opponent.health <= 0) {
    g.victory = true;
    g.done = true;
    return;
  }

  await NextRound(g);
}

export async function Backspace(g: Battle): Promise<void> {
  g.player = AbilityChecks({
    ...g.player,
    playArea: UnplaceLast(g.player.playArea),
    scoresheet: undefined,
  });
}

export async function BackspaceId(g: Battle, id: string): Promise<void> {
  g.player = AbilityChecks({
    ...g.player,
    playArea: UnplaceById(g.player.playArea, id),
    scoresheet: undefined,
  });
}

export async function Wipe(g: Battle): Promise<void> {
  g.player = AbilityChecks({
    ...g.player,
    playArea: UnplaceAll(g.player.playArea),
    scoresheet: undefined,
  });
}

export async function Place(g: Battle, id: string): Promise<void> {
  g.player = AbilityChecks({
    ...g.player,
    playArea: PlaceById(g.player.playArea, id),
    scoresheet: undefined,
  });
}

export async function PlaceWordbank(g: Battle, id: string): Promise<void> {
  g.player = AbilityChecks({
    ...g.player,
    playArea: PlaceWord(UnplaceAll(g.player.playArea), id),
    scoresheet: undefined,
  });
}

async function UpdateScore(
  g: Battler,
  o: Battler,
  kb: KnowledgeBase,
): Promise<Scoresheet> {
  return await ScoreWord(
    kb,
    g.playArea.placed,
    g.bonuses,
    o.profile.weakness,
    lettersToString(o.playArea.placed)
  );
}

export async function UpdateScores(g: Battle): Promise<void> {
  g.player = {
    ...g.player,
    scoresheet: await UpdateScore(g.player, g.opponent, g.kb),
    checking: false,
  };
}

export async function Checking(g: Battle): Promise<void> {
  g.player = { ...g.player, checking: true };
}
