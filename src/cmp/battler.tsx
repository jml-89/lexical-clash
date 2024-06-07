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
import type { Battler } from "@/lib/battler";
import type { PlayArea } from "@/lib/playarea";
import {
  SetPlayArea,
  UseAbility,
  PlaceWordbank,
  RequestScore,
} from "@/lib/battler";

import { AbilityCarousel } from "@/cmp/ability";
import { BonusCarousel } from "@/cmp/bonus";
import type { PlayAreaFnT } from "@/cmp/playarea";
import { DrawPlayArea } from "@/cmp/playarea";
import { HealthBar, OnDarkGlass } from "@/cmp/misc";

export type BattlerFnT = (a: Battler) => Promise<Battler>;
type StateFnT = (fn: BattlerFnT) => Promise<void>;

export const DrawBattler = memo(function DrawBattler({
  get,
  set,
}: {
  get: () => Battler;
  set: (changed: () => void, battler: Battler) => Promise<void>;
}) {
  const [repaints, repaint] = useState(0);
  const statefn = useCallback(
    async (fn: BattlerFnT): Promise<void> => {
      await set(() => repaint((x) => x + 1), await fn(get()));
    },
    [get, set, repaint],
  );

  return <PlayBattler battler={get()} statefn={statefn} />;
});

function PlayBattler({
  battler,
  statefn,
}: {
  battler: Battler;
  statefn: StateFnT;
}) {
  const [view, setView] = useState("buttons");

  const somebutton = useCallback(
    (alias: string, key: string): React.ReactNode => (
      <motion.button onClick={() => setView(key)} whileTap={{ scale: 0.9 }}>
        <OnDarkGlass className="bg-lime-500/50 text-white p-2">
          {alias}
        </OnDarkGlass>
      </motion.button>
    ),
    [setView],
  );

  const closefn = useCallback(() => setView("buttons"), [setView]);
  const abilitystatefn = (s: string) => statefn((g) => UseAbility(g, s));

  const getPlayArea = (): PlayArea => battler.playArea;
  const setPlayArea = async (
    changed: () => void,
    playArea: PlayArea,
  ): Promise<void> => {
    const prev = getPlayArea();
    await statefn(
      async (battler: Battler) => await SetPlayArea(battler, playArea),
    );
    const next = getPlayArea();
    if (!Object.is(prev, next)) {
      changed();
    }
  };

  const actionArea =
    view === "buttons" ? (
      <div className="flex flex-row gap-4 justify-center">
        {battler.player.bonuses.size > 0 && somebutton("Bonuses", "bonuses")}
        {battler.player.abilities.size > 0 &&
          somebutton("Abilities", "abilities")}
        {battler.wordMatches.length > 0 && somebutton("Wordbank", "wordbank")}
      </div>
    ) : view === "abilities" ? (
      <div className="self-stretch">
        <AbilityCarousel
          abilities={battler.player.abilities}
          statefn={abilitystatefn}
          closefn={closefn}
        />
      </div>
    ) : view === "bonuses" ? (
      <div className="self-stretch">
        <BonusCarousel bonuses={battler.player.bonuses} closefn={closefn} />
      </div>
    ) : view === "wordbank" ? (
      <ListWords
        words={battler.wordMatches}
        statefn={statefn}
        closefn={closefn}
      />
    ) : (
      <></>
    );

  return (
    <div className="self-stretch flex-1 flex flex-col gap-2 items-center px-1">
      {battler.playArea.placed.length > 0 && (
        <ActionButton scoresheet={battler.scoresheet} statefn={statefn} />
      )}
      <DrawPlayArea get={getPlayArea} set={setPlayArea} />
      {actionArea}
      <div className="self-stretch">
        <HealthBar
          badguy={false}
          health={battler.health}
          healthMax={battler.healthMax}
        />
      </div>
    </div>
  );
}

function ListWords({
  words,
  statefn,
  closefn,
}: {
  words: string[];
  statefn: StateFnT;
  closefn: () => void;
}) {
  const placefn = useCallback(
    (id: string): (() => Promise<void>) => {
      return async () => {
        await statefn((g: Battler) => PlaceWordbank(g, id));
      };
    },
    [statefn],
  );

  return (
    <div className="flex flex-col gap-1 text-black">
      <ul className="flex-1 flex flex-row font-bold gap-1 flex-wrap-reverse">
        <li key="back-button">
          <button
            className="self-baseline bg-red-500 px-2 py-0.5 rounded-lg"
            onClick={closefn}
          >
            Back
          </button>
        </li>
        {words.map((word, letters) => (
          <li key={word}>
            <button
              onClick={placefn(word)}
              className="bg-orange-200 px-2 py-0.5 rounded-lg"
            >
              {word}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const ActionButton = memo(function ActionButton({
  scoresheet,
  statefn,
}: {
  scoresheet: Scoresheet | undefined;
  statefn: StateFnT;
}) {
  const [amcheck, setcheck] = useState(false);
  if (amcheck && scoresheet) {
    setcheck(false);
  }

  return amcheck ? (
    <motion.button
      key="checkbutton"
      animate={{ scale: 1 }}
      initial={{ scale: 0 }}
    >
      <OnDarkGlass className="text-2xl bg-lime-500/50 text-white p-2">
        Checking...
      </OnDarkGlass>
    </motion.button>
  ) : !scoresheet ? (
    <motion.button
      key="checkbutton"
      onClick={async () => {
        setcheck(true);
        statefn(RequestScore);
      }}
      animate={{ scale: 1 }}
      initial={{ scale: 0 }}
      whileTap={{ scale: 0.9 }}
    >
      <OnDarkGlass className="text-2xl bg-lime-500/50 text-white p-2">
        Check
      </OnDarkGlass>
    </motion.button>
  ) : !scoresheet.ok ? (
    <motion.button key="checkbutton">
      <OnDarkGlass className="text-2xl bg-red-500/50 text-white p-2">
        Invalid
      </OnDarkGlass>
    </motion.button>
  ) : (
    <></>
  );
});
