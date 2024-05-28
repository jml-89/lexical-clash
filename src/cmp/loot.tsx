import Image from "next/image";
import { useState } from "react";

import type { LootContainer } from "@/lib/loot";

import { DrawLetters } from "./letter";
import { DrawAbility } from "./ability";
import { DrawBonus } from "./bonus";
import { DrawHyperSet } from "./misc";

import { ButtonX } from "@/cmp/misc";

export function DrawLootContainer({
  loot,
  claimfn,
}: {
  loot: LootContainer;
  claimfn: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => setIsOpen(true);

  if (isOpen) {
    return <DrawOpenContainer loot={loot} claimfn={claimfn} />;
  } else {
    return <DrawClosedContainer loot={loot} openHandler={handleOpen} />;
  }
}

function DrawClosedContainer({
  loot,
  openHandler,
}: {
  loot: LootContainer;
  openHandler: () => void;
}) {
  return (
    <div className="flex-1 self-stretch flex flex-col items-center justify-center backdrop-blur-sm gap-4">
      <div className="flex-1 flex flex-col justify-center">
        <div className="self-center rounded-lg p-2 bg-slate-800 flex flex-col items-center gap-1 drop-shadow-md">
          <div className="text-2xl">{loot.title}</div>
          <Image
            src={`/items/${loot.image}`}
            alt={`Drawing of a ${loot.title}`}
            width={240}
            height={240}
          />
          <div className="italic">{loot.desc}</div>
        </div>
      </div>

      <ButtonX onClick={openHandler}>Open!</ButtonX>
    </div>
  );
}

function DrawOpenContainer({
  loot,
  claimfn,
}: {
  loot: LootContainer;
  claimfn: () => void;
}) {
  return (
    <div
      style={
        { "--image-url": `url(/items/${loot.image})` } as React.CSSProperties
      }
      className="flex-1 flex flex-col bg-[image:var(--image-url)] bg-center bg-cover"
    >
      <DrawNextLoot loot={loot} />
      <ButtonX onClick={claimfn}>Claim</ButtonX>
    </div>
  );
}

function DrawNicely({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col gap-2 justify-center items-center">
      <div className="self-stretch text-2xl bg-slate-800">
        You Found {title}!
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="bg-slate-800 p-2 rounded-lg">{children}</div>
      </div>
    </div>
  );
}

function DrawNextLoot({ loot }: { loot: LootContainer }) {
  if (loot.abilities.length > 0) {
    return (
      <DrawNicely title="An Ability">
        <DrawAbility ability={loot.abilities[0]} />
      </DrawNicely>
    );
  }

  if (loot.bonuses.length > 0) {
    return (
      <DrawNicely title="A Boon">
        <DrawBonus bonus={loot.bonuses[0]} />
      </DrawNicely>
    );
  }

  if (loot.hypers.length > 0) {
    return (
      <DrawNicely title="A Word Pack">
        <DrawHyperSet hs={loot.hypers[0]} />
      </DrawNicely>
    );
  }

  return (
    <DrawNicely title={`${loot.letters.length} Letters`}>
      <DrawLetters letters={loot.letters} />
    </DrawNicely>
  );
}
