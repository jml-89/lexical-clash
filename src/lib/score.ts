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

import { IsWordValid, AreWordsRelated, ApplyBonuses } from "./wordnet";

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
  };

  sheet.adds.push({
    source: "Letter Score Sum",
    value: LetterScore(placed),
  });

  sheet.muls.push({
    source: "Base Mult.",
    value: 1,
  });

  const word = lettersToString(placed);
  sheet.ok = await IsWordValid(word);
  if (!sheet.ok) {
    return sheet;
  }

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
      value: 1,
    });
  }

  if (opposingWord && (await AreWordsRelated("hypernym", opposingWord, word))) {
    sheet.muls.push({
      source: "Undercut",
      value: 0.2,
    });
  }

  if (opposingWord && (await AreWordsRelated("hypernym", word, opposingWord))) {
    sheet.muls.push({
      source: "Overcut",
      value: 0.2,
    });
  }

  sumScore(sheet);
  return sheet;
}

function sumScore(s: Scoresheet): void {
  const add = (xs: number, x: ScoreModifier): number => xs + x.value;
  s.totalAdd = s.adds.reduce(add, 0);
  s.totalMul = s.muls.reduce(add, 0);
  s.score = Math.round(s.totalAdd * s.totalMul);
}
