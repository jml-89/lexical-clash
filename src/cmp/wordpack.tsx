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

export function DrawWordpack({ wordpack }: { wordpack: Wordpack }) {
  return (
    <div key={wordpack.hypernym} className="flex flex-col gap-1 justify-start">
      <div className="flex flex-row justify-between">
        <h1 className="text-xl font-bold">{wordpack.hypernym}</h1>
        <div>
          ({wordpack.definitions.length} definitions, {wordpack.length} words)
        </div>
      </div>

      <div className="self-baseline italic">{wordpack.definitions[0]}</div>

      <ul className="flex flex-row flex-wrap place-content-around gap-1">
        {wordpack.sample.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
