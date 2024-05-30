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

import type { Scene, Location } from "@/lib/scene";
import {
  OnBattle,
  GetConnectedScenes,
  ChooseConnection,
  StartBattle,
  EndIntro,
  TakeLootItem,
  TakeBattleLootItem,
} from "@/lib/scene";

import type { BattleFnT } from "@/cmp/battle";
import { PlayBattle } from "@/cmp/battle";
import { OpponentMugshotMinimal } from "@/cmp/opponent";
import { DrawLootContainer } from "@/cmp/loot";

import { ButtonX, GlassButton } from "@/cmp/misc";

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
    <DrawLocation location={scene.location}>
      <PlaySceneContent scene={scene} statefn={statefn} />
    </DrawLocation>
  );
}

function SceneLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col justify-center items-stretch">
      <div className="text-4xl font-light bg-slate-800 self-stretch p-1 flex flex-row justify-center">
        {title}
      </div>
      {children}
    </div>
  );
}

function PlaySceneContent({
  scene,
  statefn,
}: {
  scene: Scene;
  statefn: StateFnT;
}) {
  const battlefn = useCallback(
    (fn: BattleFnT) => statefn((g) => OnBattle(g, fn)),
    [statefn],
  );

  if (scene.intro) {
    return (
      <SceneLayout title={scene.location.title}>
        <motion.div
          className="flex-1 flex flex-row justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 100 }}
          transition={{ duration: 1 }}
        >
          <GlassButton onClick={() => statefn(EndIntro)}>Explore!</GlassButton>
        </motion.div>
      </SceneLayout>
    );
  }

  if (scene.battle) {
    return <PlayBattle battle={scene.battle} statefn={battlefn} />;
  }

  if (scene.opponent) {
    return (
      <SceneLayout title="A Foe Appears!">
        <div className="flex-1 flex flex-col justify-center items-center gap-2">
          <motion.div
            animate={{ x: [0, -2, 2, 0] }}
            transition={{
              when: "afterChildren",
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 1.5,
            }}
          >
            <motion.button
              onClick={() => statefn(StartBattle)}
              className="shadow-slate-900 shadow-lg"
              initial={{ scale: 0.1 }}
              animate={{ scale: 1.0 }}
              transition={{ duration: 1.5 }}
            >
              <OpponentMugshotMinimal opponent={scene.opponent} />
            </motion.button>
          </motion.div>
        </div>
      </SceneLayout>
    );
  }

  if (scene.battleloot) {
    // loot interaction
    return (
      <SceneLayout title="The Spoils of Battle!">
        <DrawLootContainer
          key="battleloot"
          loot={scene.battleloot}
          claimfn={() => statefn(TakeBattleLootItem)}
        />
      </SceneLayout>
    );
  }

  if (scene.loot) {
    // loot interaction
    return (
      <SceneLayout title="Loot!">
        <DrawLootContainer
          key="locationloot"
          loot={scene.loot}
          claimfn={() => statefn(TakeLootItem)}
        />
      </SceneLayout>
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
    <SceneLayout title="Choose Your Path">
      <div className="flex-1 flex flex-col justify-evenly items-center gap-2 backdrop-blur-sm">
        {GetConnectedScenes(scene).map((location) => (
          <DrawLocationPreview
            key={location.title}
            location={location}
            clickHandler={() => choosefn(location.title)}
          />
        ))}
      </div>
    </SceneLayout>
  );
}

function DrawLocationPreview({
  location,
  clickHandler,
}: {
  location: Location;
  clickHandler: () => Promise<void>;
}) {
  //<div className="text-3xl">{location.title}</div>
  //<div className="italic">{location.desc}</div>

  return (
    <motion.button
      onClick={clickHandler}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="shadow-slate-900 shadow-lg">
        <Image
          src={`/bg/${location.image}`}
          alt={`Illustration of ${location.title}`}
          height={240}
          width={240}
        />
      </div>
    </motion.button>
  );
}

function DrawLocation({
  location,
  children,
}: {
  location: Location;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      style={
        { "--image-url": `url(/bg/${location.image})` } as React.CSSProperties
      }
      className="flex-1 flex flex-col bg-[image:var(--image-url)] bg-center bg-cover"
    >
      {children}
    </motion.div>
  );
}
