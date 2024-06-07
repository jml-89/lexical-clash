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
import { OnDarkGlass } from "@/cmp/misc";

export type PlayAreaFnT = (p: PlayArea) => PlayArea;
type StateFnT = (fn: PlayAreaFnT) => Promise<void>;

export const DrawPlayArea = memo(function DrawPlayArea({
  get,
  set,
}: {
  get: () => PlayArea;
  set: (changed: () => void, playArea: PlayArea) => Promise<void>;
}) {
  const [repaints, repaint] = useState(0);
  const statefn = useCallback(
    async (fn: PlayAreaFnT): Promise<void> => {
      await set(() => repaint((x) => x + 1), await fn(get()));
    },
    [get, set, repaint],
  );

  return <PlayPlayArea playarea={get()} statefn={statefn} />;
});

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

  return (
    <div className="self-stretch flex flex-row items-center justify-between gap-1">
      <button onClick={async () => await statefn(UnplaceAll)}>
        <OnDarkGlass className="text-lg text-black p-1 bg-red-500/50">
          Clear
        </OnDarkGlass>
      </button>

      <div className={`flex flex-row flex-wrap ${gap}`}>
        {letters.map((letter) => (
          <PlacedLetter
            key={letter.id}
            letter={letter}
            statefn={statefn}
            size={size}
          />
        ))}
      </div>

      <button onClick={async () => await statefn(UnplaceLast)}>
        <OnDarkGlass className="text-lg text-black p-1 bg-red-500/50">
          ⌫
        </OnDarkGlass>
      </button>
    </div>
  );
});

const PlacedLetter = memo(function PlacedLetter({
  letter,
  statefn,
  size,
}: {
  letter: Letter;
  statefn: StateFnT;
  size: number;
}) {
  return (
    <motion.button
      layoutId={letter.id}
      key={letter.id}
      onClick={async () =>
        await statefn((p: PlayArea) => UnplaceById(p, letter.id))
      }
      whileTap={{ scale: 0.9 }}
    >
      <DrawLetter letter={letter} size={size} />
    </motion.button>
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
        <HandStack
          key={stack.length > 0 ? stack[0].id : `empty-${idx}`}
          stack={stack}
          onClick={placefn}
        />
      ))}
    </div>
  );
});

const HandStack = memo(function HandStack({
  stack,
  onClick,
}: {
  stack: LetterStack;
  onClick: (letter: Letter) => void;
}) {
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
      return "grid-rows-10";
    }
    if (n < 4) {
      return "grid-rows-11";
    }
    if (n < 6) {
      return "grid-rows-12";
    }
    return "grid-rows-13";
  };

  return (
    <motion.button
      key={stack[0].id}
      onClick={() => onClick(stack[0])}
      whileTap={{ scale: 0.9 }}
    >
      <div className={`grid ${rowCount(stack.length)}`}>
        {stack.map((letter, idx) => (
          <div
            key={letter.id}
            className={`col-start-1 ${startRow(idx)} row-span-10`}
          >
            <motion.div layoutId={letter.id}>
              <DrawLetter letter={letter} size={0} />
            </motion.div>
          </div>
        ))}
      </div>
    </motion.button>
  );
});
