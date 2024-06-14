//score
// Scoring takes place on the server to reduce round trips
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

"use server";

import type { Letter } from "./letter";
import { lettersToString, LetterScore } from "./letter";

import type { BonusCard, BonusImpl } from "./bonus";
import { BonusImpls } from "./bonus";

import {
  Definitions,
  IsWordValid,
  AreWordsRelated,
  ApplyBonuses,
} from "./wordnet";

// score = totalAdd+totalMul = sum(adds) + sum(muls)
// Redundant, yes; convenient, very yes
export interface Scoresheet {
  ok: boolean;

  score: number;

  totalAdd: number;
  totalMul: number;
  adds: ScoreModifier[];
  muls: ScoreModifier[];

  definitions: string[];
}

export interface ScoreModifier {
  source: string;
  value: number;
}

export async function ScoreWord(
  placed: Letter[],
  bonuses?: BonusCard[],
  weakness?: string,
  opposingWord?: string,
): Promise<Scoresheet> {
  let sheet: Scoresheet = {
    ok: false,
    score: 0,
    totalAdd: 0,
    totalMul: 0,
    adds: [],
    muls: [],
    definitions: [],
  };

  sheet.adds.push({
    source: "Letters",
    value: LetterScore(placed),
  });

  const word = lettersToString(placed);
  sheet.ok = await IsWordValid(word);
  if (!sheet.ok) {
    return sheet;
  }

  sheet.definitions = await Definitions(word);

  if (bonuses) {
    for (const bonus of bonuses) {
      const val = await ApplyBonuses(
        [{ word: word, base: LetterScore(placed), score: 0 }],
        [bonus],
      );
      if (val[0].score > val[0].base) {
        sheet.adds.push({
          source: bonus.name,
          value: bonus.weight * bonus.level,
        });
      }
    }
  }

  if (weakness && (await AreWordsRelated("hypernym", weakness, word))) {
    sheet.muls.push({
      source: `Weakness: ${weakness}`,
      value: 2,
    });
  }

  if (opposingWord && (await AreWordsRelated("hypernym", opposingWord, word))) {
    sheet.muls.push({
      source: "Undercut",
      value: 1.2,
    });
  }

  if (opposingWord && (await AreWordsRelated("hypernym", word, opposingWord))) {
    sheet.muls.push({
      source: "Overcut",
      value: 1.2,
    });
  }

  sumScore(sheet);
  return sheet;
}

function sumScore(s: Scoresheet): void {
  const add = (xs: number, x: ScoreModifier): number => xs + x.value;
  s.totalAdd = s.adds.reduce(add, 0);
  s.totalMul = s.muls.reduce((xs, x) => xs + (x.value - 1), 1);
  s.score = Math.round(s.totalAdd * s.totalMul);
}
