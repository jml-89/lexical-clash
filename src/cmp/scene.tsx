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
  EndIntro,
  TakeLootItem,
} from "@/lib/scene";

import type { BattleFnT } from "@/cmp/battle";
import { PlayBattle } from "@/cmp/battle";
import { OpponentMugshot } from "@/cmp/opponent";
import { DrawLootContainer } from "@/cmp/loot";

import { ButtonX } from "@/cmp/misc";

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

  if (scene.desc) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center gap-1">
        <div className="flex-1 flex flex-col justify-center">
          <div className="self-stretch p-6 backdrop-blur-lg flex flex-row justify-center">
            <div className="text-4xl italic text-white drop-shadow-2xl">
              {scene.desc}
            </div>
          </div>
        </div>
        <ButtonX onClick={() => statefn(EndIntro)}>Explore!</ButtonX>
      </div>
    );
  }

  if (scene.battle) {
    return <PlayBattle battle={scene.battle} statefn={battlefn} />;
  }

  if (scene.opponent) {
    return (
      <div className="flex-1 self-stretch flex flex-col justify-center gap-2 self-center">
        <div className="text-4xl bg-slate-800 self-stretch p-2">
          A Foe Appears!
        </div>
        <div className="flex-1 flex flex-col justify-center items-center gap-2">
          <div className="bg-slate-800 p-2 rounded-lg">
            <OpponentMugshot opponent={scene.opponent} />
          </div>
        </div>
        <button className="self-center" onClick={() => statefn(StartBattle)}>
          <div className="p-4 text-4xl bg-red-800">Start Battle!</div>
        </button>
      </div>
    );
  }

  if (scene.loot) {
    // loot interaction
    return (
      <DrawLootContainer
        loot={scene.loot}
        claimfn={() => statefn(TakeLootItem)}
      />
    );
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
    <div className="flex-1 self-stretch backdrop-blur-sm flex flex-col justify-center gap-2 self-center">
      <div className="text-4xl bg-slate-800 self-stretch p-2">
        Choose Your Path
      </div>
      <div className="flex-1 flex flex-col justify-center items-center gap-2">
        {GetConnectedScenes(scene).map((draft) => (
          <DrawDraft
            key={draft.title}
            draft={draft}
            clickHandler={() => choosefn(draft.title)}
          />
        ))}
      </div>
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
      <div className="p-2 bg-slate-700 rounded-lg flex flex-col justify-center items-center gap-1">
        <div className="text-3xl">{draft.title}</div>
        <Image
          src={`/bg/${draft.image}`}
          alt={`Illustration of ${draft.title}`}
          height={180}
          width={180}
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
      style={
        { "--image-url": `url(/bg/${scene.image})` } as React.CSSProperties
      }
      className="flex-1 flex flex-col bg-[image:var(--image-url)] bg-center bg-cover"
    >
      {children}
    </div>
  );
}
