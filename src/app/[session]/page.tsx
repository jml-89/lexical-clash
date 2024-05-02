import Link from "next/link";

import {
  IsWordValid,
  GuessScores,
  AreWordsRelated,
  HypoForms,
  Candidates,
  GetSession,
  SetSession,
  ServerSeed,
} from "@/lib/wordnet";
import { KnowledgeBase } from "@/lib/util";

import { Game } from "./game";

export default async function Home({
  params,
}: {
  params: {
    session: string;
  };
}) {
  const session = await GetSession(params.session);
  const wordnet: KnowledgeBase = {
    valid: IsWordValid,
    related: AreWordsRelated,
    rescore: GuessScores,
    hypos: HypoForms,
    candidates: Candidates,
    save: SetSession,
  };

  return (
    <Game
      sid={params.session}
      seed={await ServerSeed()}
      save={session}
      knowledge={wordnet}
    />
  );
}
