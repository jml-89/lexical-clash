import { InitialiseDatabase, DropSaves } from "@/lib/wordnet";
import { BigButton } from "./button";

export default async function Init() {
  return (
    <div className="flex flex-col">
      <BigButton
        msg="Initialise Database"
        msgpressed="Initialising"
        fn={InitialiseDatabase}
      />

      <BigButton
        msg="Drop Saved Sessions"
        msgpressed="Dropping"
        fn={DropSaves}
      />
    </div>
  );
}
