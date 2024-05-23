"use client";

import Link from "next/link";
import Image from "next/image";
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

import type { Battler } from "@/lib/battler";
import {} from "@/lib/battler";

import {
  Battle,
  Submit,
  PlaceWordbank,
  UseAbility,
  UpdateScores,
  Checking,
  OnPlayArea,
} from "@/lib/battle";

import type { Scoresheet } from "@/lib/score";

import { CreateMutator } from "@/lib/util";

import { DrawScoresheet } from "@/cmp/score";
import { DrawPlayArea, PlayAreaFnT } from "@/cmp/playarea";
import { DrawOpponent } from "@/cmp/opponent";
import { HealthBar } from "@/cmp/misc";

import { AbilityCarousel } from "@/cmp/ability";
import { BonusCarousel } from "@/cmp/bonus";

type battlefn = (a: Battle) => Promise<void>;
type statefnT = (fn: battlefn) => Promise<void>;

export function PlayBattle({
  game,
  endfn,
}: {
  game: Battle;
  endfn: (b: Battle) => Promise<void>;
}) {
  const [myGameX, setMyGameX] = useState(game);
  const mutator = useRef(CreateMutator(myGameX, setMyGameX, endfn));
  const myGame = mutator.current.get();
  const statefn = mutator.current.set;

  return (
    <main className="flex-1 flex flex-col items-center p-1 gap-1 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-700">
      <DrawOpponent opp={myGame.opponent} />
      <Contest
        ps={myGame.player.scoresheet}
        os={myGame.opponent.scoresheet}
        statefn={statefn}
      />
      <Player player={myGame.player} statefn={statefn} />
    </main>
  );
}

const ActionButton = memo(function ActionButton({
  checking,
  scoresheet,
  statefn,
}: {
  checking: boolean;
  scoresheet: Scoresheet | undefined;
  statefn: statefnT;
}) {
  return checking ? (
    <motion.button
      key="checkbutton"
      className="p-2 rounded-lg bg-lime-300 text-2xl"
      animate={{ scale: 1 }}
      initial={{ scale: 0 }}
    >
      Checking...
    </motion.button>
  ) : !scoresheet ? (
    <motion.button
      key="checkbutton"
      className="p-2 rounded-lg bg-lime-300 text-2xl"
      onClick={async () => {
        await statefn(Checking);
        await statefn(UpdateScores);
      }}
      animate={{ scale: 1 }}
      initial={{ scale: 0 }}
    >
      Check
    </motion.button>
  ) : !scoresheet.ok ? (
    <motion.button
      key="checkbutton"
      className="p-2 rounded-lg bg-red-200 text-2xl"
    >
      Invalid
    </motion.button>
  ) : (
    <></>
  );
});

function AttackButton({ statefn }: { statefn: statefnT }) {
  return (
    <motion.button
      key="attackbutton"
      className="p-4 m-4 rounded-lg bg-lime-500 text-2xl"
      onClick={async () => await statefn(Submit)}
      animate={{ scale: 1 }}
      initial={{ scale: 0 }}
      exit={{ scale: 0 }}
    >
      Attack
    </motion.button>
  );
}

const Contest = memo(function Contest({
  ps,
  os,
  statefn,
}: {
  ps: Scoresheet | undefined;
  os: Scoresheet | undefined;
  statefn: statefnT;
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

const Player = memo(function Player({
  player,
  statefn,
}: {
  player: Battler;
  statefn: statefnT;
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
        {somebutton("Bonuses", "bonuses")}
        {somebutton("Abilities", "abilities")}
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
        healthMax={player.profile.healthMax}
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
  statefn: statefnT;
  closefn: () => void;
}) {
  const placefn = (id: string): (() => Promise<void>) => {
    return async () => {
      await statefn((g: Battle) => PlaceWordbank(g, id));
      await statefn(Checking);
      await statefn(UpdateScores);
    };
  };

  return (
    <div className="flex flex-col gap-1">
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
