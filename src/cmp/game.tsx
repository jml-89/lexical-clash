"use client";

import Link from "next/link";
import { memo, useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { GameState } from "@/lib/game";
import { NewGame, LoadGame } from "@/lib/game";

import type { Scene } from "@/lib/scene";

import type { SceneFnT } from "@/cmp/scene";
import { PlayScene } from "@/cmp/scene";

import { useStateShim } from "./misc";

export function PlayGame({
  seed,
  save,
  cheatmode,
}: {
  seed: number;
  save?: Object;
  cheatmode?: boolean;
}) {
  const [game, setGame] = useState(
    cheatmode
      ? NewGame(seed, cheatmode)
      : save
        ? LoadGame(save)
        : NewGame(seed),
  );
  return <GameScene game={game} setGame={setGame} />;
}

function GameScene({
  game,
  setGame,
}: {
  game: GameState;
  setGame: (g: GameState) => void;
}) {
  const [scene, returnHandler] = useStateShim(
    game.scene,
    async (scene: Scene) => {
      game.scene = scene;
      setGame(game);
    },
  );

  return <PlayScene scene={scene} handleReturn={returnHandler} />;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
