import Link from "next/link";
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

import type { Scene, Region } from "@/lib/scene";
import type { Battle } from "@/lib/battle";
import {
  SetBattle,
  GetConnectedLocations,
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

import { ButtonX, OnDarkGlass } from "@/cmp/misc";

export type SceneFnT = (a: Scene) => Promise<Scene>;
type StateFnT = (fn: SceneFnT) => Promise<void>;

export function PlayScene({
  get,
  set,
}: {
  get: () => Scene;
  set: (changed: () => void, scene: Scene) => Promise<void>;
}) {
  const [repaints, repaint] = useState(0);
  const mystatefn = async (fn: SceneFnT): Promise<void> => {
    await set(() => repaint((x) => x + 1), await fn(get()));
  };

  return (
    <DrawLocation location={get().region.path[get().regidx]}>
      <PlaySceneContent scene={get()} statefn={mystatefn} />
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
    <div className="flex-1 flex flex-col">
      <div className="text-4xl font-light bg-slate-800 self-stretch p-1 flex flex-row justify-center">
        {title}
      </div>
      <div className="flex-1 flex flex-col justify-center items-stretch">
        {children}
      </div>
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
  if (scene.intro) {
    return (
      <SceneLayout title={scene.region.name}>
        <motion.div
          className="flex flex-row justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 100 }}
          transition={{ duration: 0.5 }}
        >
          <button onClick={() => statefn(EndIntro)}>
            <OnDarkGlass>
              <div className="p-4 text-4xl text-white">Explore!</div>
            </OnDarkGlass>
          </button>
        </motion.div>
      </SceneLayout>
    );
  }

  if (scene.battle) {
    const getBattle = (): Battle => scene.battle as Battle;
    const setBattle = async (
      changed: () => void,
      battle: Battle,
    ): Promise<void> => {
      const prev = getBattle();
      await statefn(async (scene: Scene) => await SetBattle(scene, battle));
      const next = getBattle();
      if (!Object.is(prev, next)) {
        changed();
      }
    };

    return <PlayBattle get={getBattle} set={setBattle} />;
  }

  if (scene.opponent) {
    return (
      <SceneLayout title="A Foe Appears!">
        <div className="flex flex-col justify-center items-center gap-2">
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
              transition={{ type: "spring", bounce: 0.8, duration: 0.7 }}
            >
              <OpponentMugshotMinimal opponent={scene.opponent} />
            </motion.button>
          </motion.div>
        </div>
      </SceneLayout>
    );
  }

  if (scene.lost) {
    return (
      <SceneLayout title="Your Journey Ends">
        <div className="self-center">
          <Link href="/">
            <OnDarkGlass className="text-3xl p-4">Run Away!</OnDarkGlass>
          </Link>
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
        {GetConnectedLocations(scene).map((location) => (
          <DrawLocationPreview
            key={location}
            location={location}
            clickHandler={() => choosefn(location)}
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
  location: string;
  clickHandler: () => Promise<void>;
}) {
  return (
    <motion.button
      onClick={clickHandler}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
    >
      <div className="shadow-slate-900 shadow-lg">
        <Image
          src={`/bg/${location}`}
          alt={`Illustration of a location`}
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
  location: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      style={{ "--image-url": `url(/bg/${location})` } as React.CSSProperties}
      className="flex-1 flex flex-col bg-[image:var(--image-url)] bg-center bg-cover"
    >
      {children}
    </motion.div>
  );
}
