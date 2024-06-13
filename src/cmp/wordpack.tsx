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

import { StringCycler } from "./misc";

export function DrawWordpack({ wordpack }: { wordpack: Wordpack }) {
  return (
    <div key={wordpack.hypernym} className="flex flex-col gap-1 justify-start">
      <div className="flex flex-row justify-between items-start gap-2">
        <h1 className="text-xl font-bold">{wordpack.hypernym}</h1>
        <div className="text-sml">Wordpack</div>
        <div>{wordpack.length} words</div>
      </div>
      <StringCycler strings={wordpack.definitions} />
    </div>
  );
}
