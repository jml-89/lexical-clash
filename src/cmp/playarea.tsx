import { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";

import type { PlayArea, LetterSlot } from "@/lib/playarea";
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
  const statefn = async (fn: PlayAreaFnT): Promise<void> => {
    await set(() => repaint((x) => x + 1), await fn(get()));
  };

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
  letters: LetterSlot[];
  statefn: StateFnT;
}) {
  const placefn = useCallback(
    async (letter: Letter) =>
      await statefn((p: PlayArea) => PlaceById(p, letter.id)),
    [statefn],
  );

  return (
    <div className="flex flex-row gap-1 flex-wrap place-content-center">
      {letters.map((letter, idx) => (
        <HandLetter
          key={letter ? letter.id : `empty-${idx}`}
          letter={letter}
          onClick={placefn}
        />
      ))}
    </div>
  );
});

const HandLetter = memo(function HandLetter({
  letter,
  onClick,
}: {
  letter: Letter | undefined;
  onClick: (letter: Letter) => void;
}) {
  if (!letter) {
    return <DrawLetter letter={letter} size={0} />;
  }

  return (
    <motion.button
      layoutId={letter.id}
      key={letter.id}
      onClick={() => onClick(letter)}
      whileTap={{ scale: 0.9 }}
    >
      <DrawLetter letter={letter} size={0} />
    </motion.button>
  );
});
