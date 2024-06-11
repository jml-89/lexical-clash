import { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";

import type { PlayArea, LetterStack } from "@/lib/playarea";
import {
  PlaceById,
  UnplaceById,
  UnplaceLast,
  UnplaceAll,
} from "@/lib/playarea";

import type { Letter } from "@/lib/letter";
import { DrawLetter } from "@/cmp/letter";
import { TapGlass, OnDarkGlass } from "@/cmp/misc";

export type PlayAreaFnT = (p: PlayArea) => PlayArea;
type StateFnT = (fn: PlayAreaFnT) => Promise<void>;

export function DrawPlayArea({
  playArea,
  handleReturn,
}: {
  playArea: PlayArea;
  handleReturn: (playArea: PlayArea) => Promise<void>;
}) {
  const statefn = async (fn: PlayAreaFnT): Promise<void> => {
    handleReturn(await fn(playArea));
  };

  return <PlayPlayArea playarea={playArea} statefn={statefn} />;
}

function PlayPlayArea({
  playarea,
  statefn,
}: {
  playarea: PlayArea;
  statefn: StateFnT;
}) {
  return (
    <>
      <div className="flex-1 self-stretch">
        <PlayerPlaced letters={playarea.placed} statefn={statefn} />
      </div>
      <Hand letters={playarea.hand} statefn={statefn} />
    </>
  );
}

const PlayerPlaced = memo(function PlayerPlaced({
  letters,
  statefn,
}: {
  letters: Letter[];
  statefn: StateFnT;
}) {
  if (letters.length === 0) {
    return <></>;
  }
  const size = letters.length < 8 ? 1 : 2;
  const gap = size === 2 ? "gap-0.5" : "gap-1";

  const unplacefn = async (letter: Letter) => {
    await statefn((p: PlayArea) => UnplaceById(p, letter.id));
  };

  return (
    <div className="self-stretch flex flex-row items-center justify-between gap-1">
      <TapGlass
        onClick={async () => await statefn(UnplaceAll)}
        className="text-lg text-white p-1 bg-red-500/50"
      >
        Clear
      </TapGlass>

      <div className={`flex flex-row flex-wrap ${gap}`}>
        {letters.map((letter) => (
          <button key={letter.id} onClick={() => unplacefn(letter)}>
            <PlacedLetter key={letter.id} letter={letter} size={size} />
          </button>
        ))}
      </div>

      <TapGlass
        onClick={async () => await statefn(UnplaceLast)}
        className="text-lg text-white p-1 bg-red-500/50"
        repeat
      >
        ⌫
      </TapGlass>
    </div>
  );
});

const PlacedLetter = memo(function PlacedLetter({
  letter,
  size,
}: {
  letter: Letter;
  size: number;
}) {
  return (
    <motion.div layoutId={letter.id}>
      <DrawLetter letter={letter} size={size} />
    </motion.div>
  );
});

const Hand = memo(function Hand({
  letters,
  statefn,
}: {
  letters: LetterStack[];
  statefn: StateFnT;
}) {
  const placefn = useCallback(
    async (letter: Letter) =>
      await statefn((p: PlayArea) => PlaceById(p, letter.id)),
    [statefn],
  );

  return (
    <div className="flex flex-row gap-1 flex-wrap items-end">
      {letters.map((stack, idx) => (
        <button
          key={idx}
          onClick={stack.length === 0 ? undefined : () => placefn(stack[0])}
        >
          <HandStack
            key={stack.length > 0 ? stack[0].id : `empty-${idx}`}
            stack={stack}
          />
        </button>
      ))}
    </div>
  );
});

const HandStack = memo(function HandStack({ stack }: { stack: LetterStack }) {
  if (stack.length === 0) {
    return <DrawLetter size={0} />;
  }

  const startRow = (n: number) => {
    if (n < 1) {
      return "row-start-1 z-40";
    }
    if (n < 3) {
      return "row-start-2 z-30";
    }
    if (n < 5) {
      return "row-start-3 z-20";
    }
    return "row-start-4 z-10";
  };

  const rowCount = (n: number) => {
    if (n < 2) {
      return "grid-rows-5";
    }
    if (n < 4) {
      return "grid-rows-6";
    }
    if (n < 6) {
      return "grid-rows-7";
    }
    return "grid-rows-8";
  };

  return (
    <div className={`grid ${rowCount(stack.length)}`}>
      {stack.map((letter, idx) => (
        <div
          key={letter.id}
          className={`col-start-1 ${startRow(idx)} row-span-5`}
        >
          <motion.div layoutId={letter.id}>
            <DrawLetter letter={letter} size={0} />
          </motion.div>
        </div>
      ))}
    </div>
  );
});
