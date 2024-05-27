import { memo, useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  useAnimate,
  animate,
} from "framer-motion";

import type { Scene, SceneDraft } from "@/lib/scene";
import {
  OnBattle,
  GetConnectedScenes,
  ChooseConnection,
  StartBattle,
} from "@/lib/scene";

import type { BattleFnT } from "@/cmp/battle";
import { PlayBattle } from "@/cmp/battle";
import { OpponentMugshot } from "@/cmp/opponent";
import { DrawLootContainer } from "@/cmp/loot";

export type SceneFnT = (a: Scene) => Promise<Scene>;
type StateFnT = (fn: SceneFnT) => Promise<void>;

export function PlayScene({
  scene,
  statefn,
}: {
  scene: Scene;
  statefn: StateFnT;
}) {
  return (
    <DrawScenery scene={scene}>
      <PlaySceneContent scene={scene} statefn={statefn} />
    </DrawScenery>
  );
}

function PlaySceneContent({
  scene,
  statefn,
}: {
  scene: Scene;
  statefn: StateFnT;
}) {
  const battlefn = (fn: BattleFnT) => statefn((g) => OnBattle(g, fn));

  if (scene.opponent) {
    // introduce opponent
    return (
      <div className="self-center flex flex-col justify-center bg-slate-800 p-2 rounded-lg gap-2">
        <div className="text-6xl">A Foe Appears!</div>
        <OpponentMugshot opponent={scene.opponent} />
        <button onClick={() => statefn(StartBattle)}>
          <div className="p-2 text-3xl bg-red-800">Start Battle!</div>
        </button>
      </div>
    );
  }

  if (scene.battle) {
    // play battle
    return <PlayBattle battle={scene.battle} statefn={battlefn} />;
  }

  if (scene.loot) {
    // loot interaction
    return <DrawLootContainer loot={scene.loot} />;
  }

  const choose = (key: string) =>
    statefn((scene) => ChooseConnection(scene, key));
  return <DrawConnections scene={scene} choosefn={choose} />;
}

function DrawConnections({
  scene,
  choosefn,
}: {
  scene: Scene;
  choosefn: (key: string) => Promise<void>;
}) {
  return (
    <div className="p-2 bg-slate-900 backdrop-blur-lg flex flex-col justify-center gap-2 self-center">
      <div className="text-4xl">Choose Your Path</div>
      {GetConnectedScenes(scene).map((draft) => (
        <DrawDraft
          key={draft.title}
          draft={draft}
          clickHandler={() => choosefn(draft.title)}
        />
      ))}
    </div>
  );
}

function DrawDraft({
  draft,
  clickHandler,
}: {
  draft: SceneDraft;
  clickHandler: () => Promise<void>;
}) {
  return (
    <button onClick={clickHandler}>
      <div className="p-2 bg-slate-700 rounded-lg flex flex-col gap-1">
        <div className="text-3xl">{draft.title}</div>
        <Image
          src={`/${draft.image}`}
          alt={`Illustration of ${draft.title}`}
          height={360}
          width={360}
        />
        <div className="italic">{draft.desc}</div>
      </div>
    </button>
  );
}

function DrawScenery({
  scene,
  children,
}: {
  scene: Scene;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ "--image-url": `url(/${scene.image})` } as React.CSSProperties}
      className="flex-1 flex flex-col bg-[image:var(--image-url)] bg-cover"
    >
      {children}
    </div>
  );
}
