import Link from "next/link";

import type { ServerFunctions } from "@/lib/wordnet";
import {
  IsWordValid,
  GuessScores,
  AreWordsRelated,
  HypoForms,
  Candidates,
  SuggestWords,
  GetSession,
  SetSession,
  ServerSeed,
} from "@/lib/wordnet";

import { PlayGame } from "@/cmp/game";

export default async function Home({
  params,
}: {
  params: {
    session: string;
  };
}) {
  const session = await GetSession(params.session);
  const serverfns: ServerFunctions = {
    valid: IsWordValid,
    related: AreWordsRelated,
    rescore: GuessScores,
    hypos: HypoForms,
    suggestions: SuggestWords,
    candidates: Candidates,
    save: SetSession,
  };

  return (
    <PlayGame
      sid={params.session}
      seed={await ServerSeed()}
      save={session}
      serverfns={serverfns}
    />
  );
}
