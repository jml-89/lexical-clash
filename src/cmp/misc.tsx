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

import type { ScoredWord, HyperSet } from "@/lib/util";

export const HealthBar = memo(function HealthBar({
  badguy,
  health,
  healthMax,
}: {
  badguy: boolean;
  health: number;
  healthMax: number;
}) {
  const color = badguy ? "bg-red-800" : "bg-lime-500";
  const healthpct = Math.floor((health / healthMax) * 100.0);

  return (
    <div
      className={[
        "w-full h-4",
        "border-2 border-black",
        "bg-zinc-400",
        "flex",
      ].join(" ")}
    >
      {healthpct > 0 && (
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${healthpct}%` }}
          transition={{ duration: 0.6 }}
          className={color}
        />
      )}
    </div>
  );
});

export function DrawHyperSet({ hs }: { hs: HyperSet }) {
  const stride = 3;
  const midx = Math.floor((hs.hyponyms.length - stride) / 2);

  const fli = (s: ScoredWord): React.ReactNode => (
    <li key={s.word}>{s.word}</li>
  );
  const lo = hs.hyponyms.slice(0, stride);
  const md = hs.hyponyms.slice(midx, midx + stride);
  const hi = hs.hyponyms.slice(hs.hyponyms.length - stride);

  return (
    <div key={hs.hypernym} className="flex flex-col gap-1 justify-start">
      <div className="flex flex-row justify-between">
        <h1 className="text-xl font-bold">{hs.hypernym}</h1>
        <div>
          ({hs.definitions.length} definitions, {hs.hyponyms.length} words)
        </div>
      </div>

      <div className="self-baseline italic">{hs.definitions[0]}</div>

      <ul className="flex flex-row flex-wrap place-content-around gap-1">
        {lo.map(fli)}
        <li key="low-key">...</li>
        {md.map(fli)}
        <li key="mid-key">...</li>
        {hi.map(fli)}
      </ul>
    </div>
  );
}
