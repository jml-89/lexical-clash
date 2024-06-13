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

import type { Scoresheet } from "@/lib/score";

export const DrawScoresheet = memo(function DrawScoresheet({
  sheet,
  color,
}: {
  sheet: Scoresheet;
  color: string;
}) {
  return (
    <div className={`flex flex-row-reverse justify-between gap-1 ${color}`}>
      <div className={`text-4xl ${color}`}>
        <AnimatedNumber n={sheet.score} />
      </div>
      <ScoreTable sheet={sheet} />
    </div>
  );
});

function ScoreTable({ sheet }: { sheet: Scoresheet }) {
  return (
    <table className="text-right text-sm">
      <tbody>
        {sheet.adds.map((sm) => (
          <tr key={sm.source}>
            <th className="font-medium" scope="row">
              {sm.source}
            </th>
            <td>+{sm.value}</td>
          </tr>
        ))}
        {sheet.muls.map((sm) => (
          <tr key={sm.source}>
            <th className="font-medium" scope="row">
              {sm.source}
            </th>
            <td>x{sm.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AnimatedNumber({ n }: { n: number }) {
  const [scope, animate] = useAnimate();
  const bigScore = useMotionValue(0);
  const rounded = useTransform(bigScore, (x) => Math.round(x));
  useEffect(() => {
    animate(bigScore, n, { duration: (1 / 30) * n });
  }, [animate, bigScore, n]);

  return <motion.div>{rounded}</motion.div>;
}
