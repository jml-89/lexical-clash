import { InitialiseDatabase } from "@/lib/wordnet";
import { BigButton } from "./button";

export default async function Init() {
  return (
    <BigButton
      msg="Initialise Database"
      msgpressed="Initialising"
      fn={InitialiseDatabase}
    />
  );
}
