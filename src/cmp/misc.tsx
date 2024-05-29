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

export function ButtonX({
  children,
  onClick,
  scary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  scary?: boolean;
}) {
  let colorway = "text-black bg-amber-400";
  if (scary) {
    colorway = "text-yellow bg-red-800";
  }

  return (
    <button
      className={`m-2 self-center ${colorway} rounded-lg p-4 text-2xl shadow-lg shadow-slate-900`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
