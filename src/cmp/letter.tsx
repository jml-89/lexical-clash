import { memo } from "react";
import { motion } from "framer-motion";

import type { Letter } from "@/lib/letter";
import { LetterScore } from "@/lib/letter";

export const DrawLetters = memo(function DrawLetters({
  letters,
  small,
}: {
  letters: Letter[];
  small?: boolean;
}) {
  const gap = small ? "gap-0.5" : "gap-1";
  return (
    <ul className={`flex flex-row flex-wrap justify-center ${gap}`}>
      {letters.map((letter) => (
        <motion.li layoutId={letter.id} key={letter.id}>
          <DrawLetter letter={letter} size={small ? 2 : 1} />
        </motion.li>
      ))}
    </ul>
  );
});

export const DrawLetter = memo(function DrawLetter({
  letter,
  size,
}: {
  letter: Letter | undefined;
  size: number;
}) {
  const allDimensions = [
    "w-12 h-12 border-4",
    "w-8 h-8 border-2",
    "w-5 h-5 border",
  ];
  const dimensions =
    allDimensions[Math.min(Math.max(0, size), allDimensions.length - 1)];

  // in a hand, present an empty slot of appropriate size
  if (!letter) {
    return (
      <div className={`${dimensions} border border-dotted border-black`} />
    );
  }

  const textSize = size === 0 ? "text-3xl" : "text-xl";

  const levelColors = [
    "bg-stone-400 border-stone-600",
    "bg-teal-500 border-teal-600",
    "bg-teal-300 border-teal-400",
    "bg-sky-400 border-sky-500",
    "bg-sky-300 border-sky-400",
    "bg-purple-500 border-purple-600",
    "bg-purple-300 border-purple-400",
    "bg-amber-500 border-amber-600",
    "bg-amber-300 border-amber-400",
  ];
  const levelColor =
    levelColors[Math.min(Math.max(0, letter.bonus), levelColors.length - 1)];

  if (size > 1) {
    return (
      <div
        className={[
          dimensions,
          "border-solid",
          levelColor,
          "p-0.5",
          "shadow-sm shadow-slate-800",
          "flex justify-center items-center",
        ].join(" ")}
      >
        <div className="text-black text-lg font-medium">{letter.char}</div>
      </div>
    );
  }

  return (
    <div
      className={[
        dimensions,
        "border-solid",
        "text-black",
        levelColor,
        "p-0.5",
        "shadow-lg shadow-slate-800",
        "grid grid-cols-3 grid-rows-3",
      ].join(" ")}
    >
      <div
        className={`row-start-1 col-start-1 row-span-3 col-span-2 font-bold ${textSize}`}
      >
        {letter.char}
      </div>
      <div className="row-start-3 col-start-3 self-end text-xs font-light">
        {LetterScore(letter)}
      </div>
    </div>
  );
});
