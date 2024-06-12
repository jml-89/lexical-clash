//wordpack
// for player hyperbanking

"use server";

import { GetRandomHypernym, Definitions, HypoForms } from "./wordnet";

export interface Wordpack {
  hypernym: string;
  definitions: string[];
  length: number;
  sample: string[];
}

export async function NewWordpack(level: number): Promise<Wordpack> {
  const hyper = await GetRandomHypernym(250, 3000);
  const definitions = await Definitions(hyper);
  const hyponyms = await HypoForms(hyper);

  return {
    hypernym: hyper,
    definitions: definitions,
    sample: hyponyms.slice(0, 9),
    length: hyponyms.length,
  };
}
