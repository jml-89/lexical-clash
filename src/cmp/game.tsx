"use client";

import Link from "next/link";
import { memo, useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { GameState } from "@/lib/game";
import { NewGame, LoadGame, SetScene } from "@/lib/game";

import type { Scene } from "@/lib/scene";

import type { SceneFnT } from "@/cmp/scene";
import { PlayScene } from "@/cmp/scene";

export function PlayGame({
  sid,
  seed,
  save,
}: {
  sid: string;
  seed: number;
  save: Object | undefined;
}) {
  const ref = useRef(save ? LoadGame(save) : NewGame(sid, seed));

  const getScene = (): Scene => ref.current.scene;
  const setScene = async (changed: () => void, scene: Scene): Promise<void> => {
    const prev = ref.current.scene;
    ref.current = await SetScene(ref.current, scene);
    const next = ref.current.scene;
    if (!Object.is(prev, next)) {
      changed();
    }
  };

  return <PlayScene get={getScene} set={setScene} />;
}
