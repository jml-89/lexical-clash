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
  return <PlayGame seed={await ServerSeed()} />;
}
