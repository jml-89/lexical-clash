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
import { HealthBar, TapGlass, OnDarkGlass, useStateShim } from "@/cmp/misc";

export type BattlerFnT = (a: Battler) => Promise<Battler>;
type StateFnT = (battler: Battler) => Promise<void>;

export const DrawBattler = memo(function DrawBattler({
  battler,
  handleReturn,
}: {
  battler: Battler;
  handleReturn: (battler: Battler) => Promise<void>;
}) {
  const statefn = async (next: Battler): Promise<void> => {
    await handleReturn(next);
  };
  return <PlayBattler battler={battler} statefn={statefn} />;
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
      <TapGlass
        onClick={() => setView(key)}
        className="bg-lime-500/50 text-white p-2"
      >
        {alias}
      </TapGlass>
    ),
    [setView],
  );

  const closefn = useCallback(() => setView("buttons"), [setView]);
  const abilitystatefn = async (s: string) =>
    statefn(await UseAbility(battler, s));
  const placefn = async (s: string) => statefn(await PlaceWordbank(battler, s));
  const requestfn = async () => statefn(await RequestScore(battler));

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
        placefn={placefn}
        closefn={closefn}
      />
    ) : (
      <></>
    );

  return (
    <div className="self-stretch flex-1 flex flex-col gap-2 items-center px-1">
      {battler.playArea.placed.length > 0 && (
        <ActionButton
          scoresheet={battler.scoresheet}
          checking={battler.scoreplease}
          requestfn={requestfn}
        />
      )}
      <PlayAreaState battler={battler} statefn={statefn} />
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

function PlayAreaState({
  battler,
  statefn,
}: {
  battler: Battler;
  statefn: StateFnT;
}) {
  const [playArea, returnHandler] = useStateShim(
    battler.playArea,
    async (x: PlayArea) => await statefn(await SetPlayArea(battler, x)),
  );

  return <DrawPlayArea playArea={playArea} handleReturn={returnHandler} />;
}

function ListWords({
  words,
  placefn,
  closefn,
}: {
  words: string[];
  placefn: (s: string) => Promise<void>;
  closefn: () => void;
}) {
  return (
    <div className="self-stretch flex flex-col gap-1 text-white">
      <ul className="flex-1 flex flex-row justify-between gap-0.5 flex-wrap-reverse">
        <li key="back-button">
          <TapGlass className="px-2 bg-red-400/50" onClick={closefn}>
            Back
          </TapGlass>
        </li>
        {words.map((word, letters) => (
          <li key={word}>
            <TapGlass
              onClick={async () => await placefn(word)}
              className="px-0.5 bg-green-400/50"
              repeat
            >
              {word}
            </TapGlass>
          </li>
        ))}
      </ul>
    </div>
  );
}

const ActionButton = memo(function ActionButton({
  scoresheet,
  checking,
  requestfn,
}: {
  scoresheet: Scoresheet | undefined;
  checking: boolean;
  requestfn: () => Promise<void>;
}) {
  return checking ? (
    <TapGlass
      key="checkbutton"
      repeat
      className="text-2xl bg-lime-500/50 text-white p-2"
    >
      Checking...
    </TapGlass>
  ) : !scoresheet ? (
    <TapGlass
      key="checkbutton"
      onClick={async () => {
        await requestfn();
      }}
      repeat
      className="text-2xl bg-lime-500/50 text-white p-2"
    >
      Check
    </TapGlass>
  ) : !scoresheet.ok ? (
    <TapGlass
      key="checkbutton"
      repeat
      className="text-2xl bg-red-500/50 text-white p-2"
    >
      Invalid
    </TapGlass>
  ) : (
    <></>
  );
});
