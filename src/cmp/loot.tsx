import Image from "next/image";
import { useState } from "react";

import type { LootContainer } from "@/lib/loot";

import { DrawAbility } from "./ability";
import { DrawBonus } from "./bonus";
import { DrawHyperSet } from "./misc";

export function DrawLootContainer({ loot }: { loot: LootContainer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div>{loot.title}</div>
      <Image src={loot.image} alt={`Drawing of a ${loot.title}`} />
      <div>{loot.desc}</div>
    </div>
  );
}

function DrawNextLoot({ loot }: { loot: LootContainer }) {
  if (loot.abilities.length > 0) {
    return DrawAbility({ ability: loot.abilities[0] });
  }

  if (loot.bonuses.length > 0) {
    return DrawBonus({ bonus: loot.bonuses[0] });
  }

  if (loot.words.length > 0) {
    return DrawHyperSet({ hs: loot.words[0] });
  }

  return <></>;
}
