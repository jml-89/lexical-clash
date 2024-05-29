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

import type { Battle } from "@/lib/battle";
import { Submit, OnBattler } from "@/lib/battle";

import type { Scoresheet } from "@/lib/score";

import { DrawScoresheet } from "@/cmp/score";
import { DrawComBattler } from "@/cmp/opponent";

import type { BattlerFnT } from "@/cmp/battler";
import { DrawBattler } from "@/cmp/battler";

export type BattleFnT = (a: Battle) => Promise<Battle>;
type StateFnT = (fn: BattleFnT) => Promise<void>;

export function PlayBattle({
  battle,
  statefn,
}: {
  battle: Battle;
  statefn: StateFnT;
}) {
  const battlerfn = useCallback(
    (fn: BattlerFnT) => statefn((g) => OnBattler(g, fn)),
    [statefn],
  );

  return (
    <main className="flex-1 flex flex-col items-center p-1 gap-1 backdrop-brightness-50 backdrop-saturate-0">
      <DrawComBattler opp={battle.opponent} />
      <Contest
        ps={battle.player.scoresheet}
        os={battle.opponent.scoresheet}
        statefn={statefn}
      />
      <DrawBattler battler={battle.player} statefn={battlerfn} />
    </main>
  );
}

const Contest = memo(function Contest({
  ps,
  os,
  statefn,
}: {
  ps: Scoresheet | undefined;
  os: Scoresheet | undefined;
  statefn: StateFnT;
}) {
  return (
    <div className="flex flex-row justify-center gap-2">
      <div className="flex flex-col justify-center text-sm font-light">
        {os && os.ok && <DrawScoresheet sheet={os} color="text-red-300" />}
        {ps && ps.ok && <DrawScoresheet sheet={ps} color="text-lime-400" />}
      </div>

      {ps && ps.ok && <AttackButton statefn={statefn} />}
    </div>
  );
});

function AttackButton({ statefn }: { statefn: StateFnT }) {
  return (
    <motion.button
      key="attackbutton"
      className="p-4 m-4 rounded-lg text-black bg-lime-500 text-2xl"
      onClick={async () => await statefn(Submit)}
      animate={{ scale: 1 }}
      initial={{ scale: 0 }}
      exit={{ scale: 0 }}
    >
      Attack
    </motion.button>
  );
}
