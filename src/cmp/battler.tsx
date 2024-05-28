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
import { OnPlayArea, UseAbility, PlaceWordbank, Checking } from "@/lib/battler";

import { AbilityCarousel } from "@/cmp/ability";
import { BonusCarousel } from "@/cmp/bonus";
import type { PlayAreaFnT } from "@/cmp/playarea";
import { DrawPlayArea } from "@/cmp/playarea";
import { HealthBar } from "@/cmp/misc";

export type BattlerFnT = (a: Battler) => Promise<Battler>;
type StateFnT = (fn: BattlerFnT) => Promise<void>;

export const DrawBattler = memo(function DrawBattler({
  player,
  statefn,
}: {
  player: Battler;
  statefn: StateFnT;
}) {
  const [view, setView] = useState("buttons");

  const somebutton = useCallback(
    (alias: string, key: string): React.ReactNode => (
      <button
        className="p-4 text-amber-200 bg-lime-700 rounded-lg"
        onClick={() => setView(key)}
      >
        {alias}
      </button>
    ),
    [setView],
  );

  const closefn = useCallback(() => setView("buttons"), [setView]);
  const abilitystatefn = (s: string) => statefn((g) => UseAbility(g, s));

  const actionArea =
    view === "buttons" ? (
      <div className="flex flex-row gap-4 justify-center">
        {player.bonuses.size > 0 && somebutton("Bonuses", "bonuses")}
        {player.abilities.size > 0 && somebutton("Abilities", "abilities")}
        {player.wordMatches.length > 0 && somebutton("Wordbank", "wordbank")}
      </div>
    ) : view === "abilities" ? (
      <AbilityCarousel
        abilities={player.abilities}
        statefn={abilitystatefn}
        closefn={closefn}
      />
    ) : view === "bonuses" ? (
      <BonusCarousel bonuses={player.bonuses} closefn={closefn} />
    ) : view === "wordbank" ? (
      <ListWords
        words={player.wordMatches}
        statefn={statefn}
        closefn={closefn}
      />
    ) : (
      <></>
    );

  const playfn = (fn: PlayAreaFnT) => statefn((g) => OnPlayArea(g, fn));

  return (
    <div className="flex-1 flex flex-col gap-2 items-stretch px-1">
      {player.playArea.placed.length > 0 && (
        <ActionButton
          checking={player.checking}
          scoresheet={player.scoresheet}
          statefn={statefn}
        />
      )}
      <DrawPlayArea playarea={player.playArea} statefn={playfn} />
      {actionArea}
      <HealthBar
        badguy={false}
        health={player.health}
        healthMax={player.healthMax}
      />
    </div>
  );
});

function ListWords({
  words,
  statefn,
  closefn,
}: {
  words: string[];
  statefn: StateFnT;
  closefn: () => void;
}) {
  const placefn = (id: string): (() => Promise<void>) => {
    return async () => {
      await statefn((g: Battler) => PlaceWordbank(g, id));
    };
  };

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
  checking,
  scoresheet,
  statefn,
}: {
  checking: boolean;
  scoresheet: Scoresheet | undefined;
  statefn: StateFnT;
}) {
  return checking ? (
    <motion.button
      key="checkbutton"
      className="p-2 text-black rounded-lg bg-lime-300 text-2xl"
      animate={{ scale: 1 }}
      initial={{ scale: 0 }}
    >
      Checking...
    </motion.button>
  ) : !scoresheet ? (
    <motion.button
      key="checkbutton"
      className="p-2 text-black rounded-lg bg-lime-300 text-2xl"
      onClick={async () => {
        await statefn(Checking);
      }}
      animate={{ scale: 1 }}
      initial={{ scale: 0 }}
    >
      Check
    </motion.button>
  ) : !scoresheet.ok ? (
    <motion.button
      key="checkbutton"
      className="p-2 text-black rounded-lg bg-red-200 text-2xl"
    >
      Invalid
    </motion.button>
  ) : (
    <></>
  );
});
