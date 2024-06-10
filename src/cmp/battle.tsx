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

import { OnDarkGlass, useStateShim } from "@/cmp/misc";

export type BattleFnT = (a: Battle) => Promise<Battle>;
type StateFnT = (battle: Battle) => Promise<void>;

export function PlayBattle({
  battle,
  handleReturn,
}: {
  battle: Battle;
  handleReturn: (battle: Battle) => Promise<void>;
}) {
  const statefn = async (battle: Battle): Promise<void> => {
    handleReturn(battle);
  };

  const attackfn = async (): Promise<void> => {
    const next = await Submit(battle);
    await handleReturn(next);
  };

  return (
    <main className="flex-1 flex flex-col items-center p-1 gap-1 backdrop-blur bg-black/50">
      <DrawComBattler opp={battle.opponent} />
      <Contest
        ps={battle.player.scoresheet}
        os={battle.opponent.scoresheet}
        attackfn={attackfn}
      />
      <BattlerState battle={battle} statefn={statefn} />
    </main>
  );
}

function BattlerState({
  battle,
  statefn,
}: {
  battle: Battle;
  statefn: StateFnT;
}) {
  const [battler, returnHandler] = useStateShim(
    battle,
    battle.player,
    SetBattler,
    statefn,
  );

  if (!battler) {
    return <></>;
  }

  return <DrawBattler battler={battler} handleReturn={returnHandler} />;
}

const Contest = memo(function Contest({
  ps,
  os,
  attackfn,
}: {
  ps: Scoresheet | undefined;
  os: Scoresheet | undefined;
  attackfn: () => Promise<void>;
}) {
  return (
    <div className="flex flex-row justify-center gap-2">
      <div className="flex flex-col justify-center text-sm font-light">
        {os && os.ok && <DrawScoresheet sheet={os} color="text-red-300" />}
        {ps && ps.ok && <DrawScoresheet sheet={ps} color="text-lime-400" />}
      </div>

      {ps && ps.ok && <AttackButton attackfn={attackfn} />}
    </div>
  );
});

function AttackButton({ attackfn }: { attackfn: () => Promise<void> }) {
  return (
    <motion.button
      key="attackbutton"
      onClick={attackfn}
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
