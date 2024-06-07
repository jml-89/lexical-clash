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
import { Submit, SetBattler } from "@/lib/battle";

import type { Scoresheet } from "@/lib/score";

import { DrawScoresheet } from "@/cmp/score";
import { DrawComBattler } from "@/cmp/opponent";

import type { Battler } from "@/lib/battler";
import { DrawBattler } from "@/cmp/battler";

import { OnDarkGlass } from "@/cmp/misc";

export type BattleFnT = (a: Battle) => Promise<Battle>;
type StateFnT = (fn: BattleFnT) => Promise<void>;

export function PlayBattle({
  get,
  set,
}: {
  get: () => Battle;
  set: (changed: () => void, battle: Battle) => Promise<void>;
}) {
  const [repaints, repaint] = useState(0);
  const statefn = useCallback(
    async (fn: BattleFnT): Promise<void> => {
      await set(() => repaint((x) => x + 1), await fn(get()));
    },
    [get, set, repaint],
  );

  const getBattler = (): Battler => get().player;
  const setBattler = async (
    changed: () => void,
    battler: Battler,
  ): Promise<void> => {
    const prev = getBattler();
    await statefn(async (battle: Battle) => await SetBattler(battle, battler));
    const next = getBattler();
    if (!Object.is(prev, next)) {
      changed();
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center p-1 gap-1 backdrop-blur bg-black/50">
      <DrawComBattler opp={get().opponent} />
      <Contest
        ps={get().player.scoresheet}
        os={get().opponent.scoresheet}
        statefn={statefn}
      />
      <DrawBattler get={getBattler} set={setBattler} />
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
      onClick={async () => await statefn(Submit)}
      animate={{ scale: 1 }}
      initial={{ scale: 0 }}
      exit={{ scale: 0 }}
      whileTap={{ scale: 0.9 }}
    >
      <OnDarkGlass className="bg-lime-500/75 text-white text-4xl p-4">
        Attack
      </OnDarkGlass>
    </motion.button>
  );
}
