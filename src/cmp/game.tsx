"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { GameState } from "@/lib/game";
import { NewGame, LoadGame, OnScene } from "@/lib/game";

import type { ServerFunctions } from "@/lib/wordnet";

import type { Scene } from "@/lib/scene";

import type { SceneFnT } from "@/cmp/scene";
import { PlayScene } from "@/cmp/scene";

type GameFnT = (g: GameState) => Promise<GameState>;

export function PlayGame({
  sid,
  seed,
  save,
  serverfns,
}: {
  sid: string;
  seed: number;
  save: Object | undefined;
  serverfns: ServerFunctions;
}) {
  const [game, setGame] = useState(
    save === undefined
      ? NewGame(sid, seed, serverfns)
      : LoadGame(save, serverfns),
  );

  const statefn = async function (fn: GameFnT): Promise<void> {
    setGame(await fn(game));
  };

  const scenefn = (fn: SceneFnT) => statefn((g) => OnScene(g, fn));

  return <PlayScene scene={game.scene} statefn={scenefn} />;
}
