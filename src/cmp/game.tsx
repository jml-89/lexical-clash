"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { GameState } from "@/lib/game";
import { NewGame, LoadGame, OnScene } from "@/lib/game";

import type { Scene } from "@/lib/scene";

import type { SceneFnT } from "@/cmp/scene";
import { PlayScene } from "@/cmp/scene";

type GameFnT = (g: GameState) => Promise<GameState>;

export function PlayGame({
  sid,
  seed,
  save,
}: {
  sid: string;
  seed: number;
  save: Object | undefined;
}) {
  const gameRef = useRef(save ? LoadGame(save) : NewGame(sid, seed));
  const [signal, setSignal] = useState(0);

  const statefn = useCallback(
    async function (fn: GameFnT): Promise<void> {
      gameRef.current = await fn(gameRef.current);
      setSignal((x) => x + 1);
    },
    [setSignal, gameRef],
  );

  const scenefn = useCallback(
    (fn: SceneFnT) => statefn((g) => OnScene(g, fn)),
    [statefn],
  );

  return <PlayScene scene={gameRef.current.scene} statefn={scenefn} />;
}
