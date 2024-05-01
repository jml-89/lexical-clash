//score
// Scoring takes place on the client but relies on calls to server functions
// Why?
// Server has the dictionary
// Feasible to load dictionary on client if small
// But eventually dictionary can grow to be large
// Hundreds of megabytes -- possibly eventually maybe
//
// Scoring has a few dimension
// - Letter score
// - Bonuses
// - Enemy weaknesses
// Letter score can be done client side
// Bonuses can rely on word relations, requires server functions
// And enemy weaknesses are always word relations, another server function there

import { Letter, lettersToString, simpleScore } from "./letter";

import { Opponent } from "./opponent";

import { BonusCard, BonusImpl, BonusImpls } from "./bonus";

import { KnowledgeBase } from "./util";

// score = totalAdd+totalMul = sum(adds) + sum(muls)
// Redundant, yes; convenient, very yes
export interface Scoresheet {
  ok: boolean;

  score: number;

  totalAdd: number;
  totalMul: number;
  adds: ScoreModifier[];
  muls: ScoreModifier[];
}

export interface ScoreModifier {
  source: string;
  value: number;
}

// ScoreWord really just expects a Battle object
// But nice to pare it down to what really matters
// In case of some future changes to layout
export interface ScoreInput {
  placed: Letter[];
  bonuses: Map<string, BonusCard>;
}

export async function ScoreWord(
  kb: KnowledgeBase,
  input: ScoreInput,
  opponent: Opponent,
): Promise<Scoresheet> {
  let sheet: Scoresheet = {
    ok: false,
    score: 0,
    totalAdd: 0,
    totalMul: 0,
    adds: [],
    muls: [],
  };

  sheet.adds.push({
    source: "Letter Score Sum",
    value: simpleScore(input.placed),
  });

  sheet.muls.push({
    source: "Base Mult.",
    value: 1,
  });

  const word = lettersToString(input.placed);
  sheet.ok = await kb.valid(word);
  if (!sheet.ok) {
    return sheet;
  }

  for (const [k, v] of input.bonuses) {
    const impl = BonusImpls.get(k);
    if (impl === undefined) {
      console.log(`Could not find ${k} in BonusImpls:`, BonusImpls);
      continue;
    }

    const val = await impl.fn(kb.related, input.placed);
    if (val !== 0) {
      sheet.adds.push({
        source: v.name,
        value: v.weight * v.level * val,
      });
    }
  }

  for (const weakness of opponent.weakness) {
    const hit = await kb.related("hypernym", weakness, word);
    if (!hit) {
      continue;
    }
    sheet.muls.push({
      source: `Weakness: ${weakness}`,
      value: 1,
    });
  }

  sumScore(sheet);
  return sheet;
}

function sumScore(s: Scoresheet) {
  const add = (xs: number, x: ScoreModifier): number => xs + x.value;
  s.totalAdd = s.adds.reduce(add, 0);
  s.totalMul = s.muls.reduce(add, 0);
  s.score = s.totalAdd * s.totalMul;
}
