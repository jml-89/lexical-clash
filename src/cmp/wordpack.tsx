import { memo, useState, useRef, useEffect, useCallback } from "react";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  useAnimate,
  animate,
} from "framer-motion";

import type { Wordpack } from "@/lib/wordpack";

import { delay } from "./misc";

export function DrawWordpack({ wordpack }: { wordpack: Wordpack }) {
  const [idx, setIdx] = useState(0);

  const fn = async () => {
    await delay(5000);
    setIdx((idx + 1) % wordpack.definitions.length);
  };

  // Yes, run on _every_ render!
  fn();

  return (
    <div key={wordpack.hypernym} className="flex flex-col gap-1 justify-start">
      <div className="flex flex-row justify-between items-start gap-2">
        <h1 className="text-xl font-bold">{wordpack.hypernym}</h1>
        <div className="text-sml">Wordpack</div>
        <div>{wordpack.length} words</div>
      </div>
      <div className="grid flex justify-center items-center">
        {wordpack.definitions.map((s, i) => (
          <motion.div
            key={i}
            className="row-start-1 col-start-1 italic text-start"
            initial={{ opacity: 0 }}
            animate={i === idx ? { opacity: 1 } : { opacity: 0 }}
          >
            {s}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
