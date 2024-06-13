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
          <DrawLetter letter={letter} small={small} />
        </motion.li>
      ))}
    </ul>
  );
});

export const DrawLetter = memo(function DrawLetter({
  letter,
  small,
}: {
  letter?: Letter;
  small?: boolean;
}) {
  const dimensions = small ? "w-5 h-5" : "w-8 h-8";

  if (!letter) {
    return (
      <div className={`${dimensions} border-2 border-dotted border-black`} />
    );
  }

  const textSize = small ? "text-lg" : "text-2xl";

  const levelColors = [
    "bg-stone-400",
    "bg-teal-500",
    "bg-teal-300",
    "bg-sky-400",
    "bg-sky-300",
    "bg-purple-500",
    "bg-purple-300",
    "bg-amber-500",
    "bg-amber-300",
  ];
  const levelColor =
    levelColors[Math.min(Math.max(0, letter.bonus), levelColors.length - 1)];

  return (
    <div
      className={`${dimensions} ${levelColor} shadow-md shadow-slate-900 grid`}
    >
      <div className="size-full row-start-1 col-start-1 flex justify-center items-center">
        <div className={`leading-none font-bold text-black ${textSize}`}>
          {letter.char}
        </div>
      </div>

      {!small && (
        <div className="size-full row-start-1 col-start-1 flex justify-end items-end">
          <div className="leading-none text-black text-xs">
            {LetterScore(letter)}
          </div>
        </div>
      )}
    </div>
  );
});
