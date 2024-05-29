import Link from "next/link";

import { ServerSeed } from "@/lib/serverfunctions";
import { GetSession } from "@/lib/wordnet";

import { PlayGame } from "@/cmp/game";

export default async function Home({
  params,
}: {
  params: {
    session: string;
  };
}) {
  const session = await GetSession(params.session);
  return (
    <PlayGame sid={params.session} seed={await ServerSeed()} save={session} />
  );
}
