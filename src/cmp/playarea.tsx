import { memo, useCallback } from "react";
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

export type PlayAreaFnT = (p: PlayArea) => PlayArea;
type StateFnT = (fn: PlayAreaFnT) => Promise<void>;

export const DrawPlayArea = memo(function DrawPlayArea({
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
});

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
    <div className="self-stretch flex flex-row justify-between gap-1">
      <button
        className="bg-red-500 text-black p-1 rounded-lg align-top text-lg"
        onClick={async () => await statefn(UnplaceAll)}
      >
        Clear
      </button>

      <ul className={`flex flex-row flex-wrap ${gap}`}>
        {letters.map((letter) => (
          <PlacedLetter
            key={letter.id}
            letter={letter}
            statefn={statefn}
            size={size}
          />
        ))}
      </ul>

      <button
        className="bg-red-500 text-black p-1 rounded-lg text-lg font-black"
        onClick={async () => await statefn(UnplaceLast)}
      >
        ⌫
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
    <motion.li layoutId={letter.id} key={letter.id}>
      <button
        onClick={async () =>
          await statefn((p: PlayArea) => UnplaceById(p, letter.id))
        }
      >
        <DrawLetter letter={letter} size={size} />
      </button>
    </motion.li>
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
    <ul className="flex flex-row gap-1 flex-wrap place-content-center">
      {letters.map((letter, idx) => (
        <HandLetter
          key={letter ? letter.id : `empty-${idx}`}
          letter={letter}
          onClick={placefn}
        />
      ))}
    </ul>
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
    <motion.li layoutId={letter.id} key={letter.id}>
      <button onClick={() => onClick(letter)}>
        <DrawLetter letter={letter} size={0} />
      </button>
    </motion.li>
  );
});
