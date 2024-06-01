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
  const barcolor = badguy ? "bg-red-800" : "bg-lime-500";
  const healthpct = Math.floor((health / healthMax) * 100.0);

  return (
    <div
      className={[
        "h-6",
        "shadow-slate-900 shadow-sm border-1 border-black",
        "bg-zinc-400",
        "grid",
      ].join(" ")}
    >
      {healthpct > 0 && (
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${healthpct}%` }}
          transition={{ duration: 0.6 }}
          className={`${barcolor} row-start-1 col-start-1`}
        />
      )}
      <div className="text-black text-sm font-medium row-start-1 col-start-1 flex flex-row justify-center items-center">
        {health}/{healthMax}
      </div>
    </div>
  );
});

export function OnDarkGlass({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  let cn =
    "backdrop-blur-lg bg-black/50 rounded-lg border border-black shadow-lg shadow-slate-900";
  if (className) {
    cn = `${cn} ${className}`;
  }
  return (
    <div className={cn}>
      <div className="flex flex-row justify-center">{children}</div>
    </div>
  );
}

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
