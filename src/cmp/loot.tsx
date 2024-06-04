import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { LootContainer } from "@/lib/loot";

import { DrawLetters } from "./letter";
import { DrawAbility } from "./ability";
import { DrawBonus } from "./bonus";
import { DrawWordpack } from "./wordpack";

import { ButtonX, OnDarkGlass } from "@/cmp/misc";

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
    return <DrawClosedContainerMinimal loot={loot} openHandler={handleOpen} />;
  }
}

function DrawClosedContainerMinimal({
  loot,
  openHandler,
}: {
  loot: LootContainer;
  openHandler: () => void;
}) {
  const [clicked, setClicked] = useState(false);
  const clickfn = () => {
    if (clicked) {
      return;
    }
    setClicked(true);
    openHandler();
  };

  return (
    <div className="self-stretch flex flex-col items-center justify-center gap-4">
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence>
          {!clicked && (
            <motion.button
              key="loot-image"
              animate={{ rotate: [0, -2, 2, 0] }}
              whileTap={{ scale: 0.5 }}
              exit={{ scale: 2 }}
              transition={{
                when: "afterChildren",
                duration: 0.2,
                repeat: Infinity,
                repeatDelay: 1.5,
              }}
              onClick={clickfn}
            >
              <motion.div
                initial={{ y: -150 }}
                animate={{ y: 0 }}
                className="shadow-slate-900 shadow-lg"
              >
                <Image
                  src={`/items/${loot.image}`}
                  alt="Drawing of some loot"
                  width={240}
                  height={240}
                />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
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
      <DrawNextLoot loot={loot} claimfn={claimfn} />
    </div>
  );
}

function DrawNicely({
  title,
  claimfn,
  children,
}: {
  title: string;
  claimfn: () => void;
  children: React.ReactNode;
}) {
  const [clicked, setClicked] = useState(false);
  const clickfn = () => {
    if (clicked) {
      return;
    }
    setClicked(true);
    claimfn();
  };

  return (
    <div className="flex-1 self-stretch flex flex-col gap-2 justify-center items-center">
      <div className="self-stretch text-2xl bg-slate-800 flex flex-row justify-center">
        You Found {title}!
      </div>
      <div className="flex-1 self-stretch flex flex-col justify-center items-center">
        <motion.div
          animate={{ y: [0, -2, 2, 0] }}
          transition={{
            repeat: Infinity,
            duration: 0.5,
            repeatDelay: 1,
            when: "afterChildren",
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            whileTap={{ scale: 0.9 }}
            className="flex-1 flex flex-col justify-center"
            onClick={clickfn}
          >
            <OnDarkGlass className="text-white p-2">{children}</OnDarkGlass>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function DrawNextLoot({
  loot,
  claimfn,
}: {
  loot: LootContainer;
  claimfn: () => void;
}) {
  const next = loot.contents[0];
  switch (next.type) {
    case "ability":
      return (
        <DrawNicely key={next.type} title="An Ability" claimfn={claimfn}>
          <DrawAbility ability={next.item} />
        </DrawNicely>
      );

    case "bonus":
      return (
        <DrawNicely key={next.type} title="A Boon" claimfn={claimfn}>
          <DrawBonus bonus={next.item} />
        </DrawNicely>
      );

    case "wordpack":
      return (
        <DrawNicely key={next.type} title="A Word Pack" claimfn={claimfn}>
          <DrawWordpack wordpack={next.item} />
        </DrawNicely>
      );

    case "letters":
      return (
        <DrawNicely
          key={next.type}
          title={`${next.item.length} Letters`}
          claimfn={claimfn}
        >
          <DrawLetters letters={next.item} />
        </DrawNicely>
      );
  }
}
