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

import type { ServerFunctions } from "./wordnet";
import { ScoredWord } from "./util";

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

export async function ScoreWord(
  kb: ServerFunctions,
  placed: Letter[],
  bonuses: Map<string, BonusCard>,
  weaknesses: string[],
  opposingWord: string,
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
    value: simpleScore(placed),
  });

  sheet.muls.push({
    source: "Base Mult.",
    value: 1,
  });

  const word = lettersToString(placed);
  sheet.ok = await kb.valid(word);
  if (!sheet.ok) {
    return sheet;
  }

  const vq = { word: word, base: simpleScore(placed), score: 0 };
  for (const [k, v] of bonuses) {
    const s = BonusImpls.get(v.key);
    if (!s) {
      continue;
    }
    const bq = { query: s.query, score: v.weight * v.level };

    /*
    const val = await kb.rescore([vq], [bq]);
    if (val[0].score > val[0].base) {
      sheet.adds.push({
        source: v.name,
        value: v.weight * v.level,
      });
    }
    */
  }

  for (const weakness of weaknesses) {
    const hit = await kb.related("hypernym", weakness, word);
    if (!hit) {
      continue;
    }
    sheet.muls.push({
      source: `Weakness: ${weakness}`,
      value: 1,
    });
  }

  if (await kb.related("hypernym", opposingWord, word)) {
    sheet.muls.push({
      source: "Undercut",
      value: 0.2,
    });
  }

  if (await kb.related("hypernym", word, opposingWord)) {
    sheet.muls.push({
      source: "Overcut",
      value: 0.2,
    });
  }

  sumScore(sheet);
  return sheet;
}

function sumScore(s: Scoresheet) {
  const add = (xs: number, x: ScoreModifier): number => xs + x.value;
  s.totalAdd = s.adds.reduce(add, 0);
  s.totalMul = s.muls.reduce(add, 0);
  s.score = Math.round(s.totalAdd * s.totalMul);
}
