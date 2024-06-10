import Link from "next/link";
import { memo, useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

import { motion, AnimatePresence } from "framer-motion";

import type { Scene, Region } from "@/lib/scene";
import {
  SetBattle,
  GetConnectedLocations,
  ChooseConnection,
  StartBattle,
  EndIntro,
  TakeLootItem,
  TakeBattleLootItem,
  SetShop,
} from "@/lib/scene";

import type { Battle } from "@/lib/battle";
import type { Shop } from "@/lib/shop";

import type { BattleFnT } from "@/cmp/battle";
import { PlayBattle } from "@/cmp/battle";
import { OpponentMugshotMinimal } from "@/cmp/opponent";
import { DrawLootContainer } from "@/cmp/loot";
import { PlayShop } from "@/cmp/shop";

import { OnDarkGlass, useStateShim } from "@/cmp/misc";

export type SceneFnT = (a: Scene) => Promise<Scene>;
type StateFnT = (scene: Scene) => Promise<void>;

export function PlayScene({
  scene,
  handleReturn,
}: {
  scene: Scene;
  handleReturn: (scene: Scene) => Promise<void>;
}) {
  const statefn = async (scene: Scene): Promise<void> => {
    handleReturn(scene);
  };

  return (
    <DrawLocation location={scene.region.path[scene.regidx]}>
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

function SceneLoot({ children }: { children: React.ReactNode }) {}

function SceneExplore({ scene, statefn }: { scene: Scene; statefn: StateFnT }) {
  const [clicked, setClicked] = useState(false);
  const clickfn = async () => {
    if (clicked) {
      return;
    }
    setClicked(true);
    statefn(await EndIntro(scene));
  };

  return (
    <SceneLayout title={scene.region.name}>
      <AnimatePresence>
        {!clicked && (
          <motion.button
            key="explore-button"
            className="flex flex-row self-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 100 }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={clickfn}
          >
            <OnDarkGlass>
              <div className="p-4 text-4xl text-white">Explore!</div>
            </OnDarkGlass>
          </motion.button>
        )}
      </AnimatePresence>
    </SceneLayout>
  );
}

function SceneOpponent({
  scene,
  statefn,
}: {
  scene: Scene;
  statefn: StateFnT;
}) {
  const [clicked, setClicked] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const clickfn = async () => {
    if (clicked) {
      return;
    }

    setClicked(true);
    statefn(await StartBattle(scene));
  };

  if (!scene.opponent) {
    return <></>;
  }

  return (
    <SceneLayout title="A Foe Appears!">
      <div className="flex flex-col justify-center items-center gap-2">
        <AnimatePresence>
          {!clicked && (
            <motion.button
              onClick={clickfn}
              variants={{
                hidden: { x: [0] },
                visible: {
                  x: [0, -2, 2, 0],
                  transition: {
                    when: "afterChildren",
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                  },
                },
              }}
              whileTap={{ scale: 0.9 }}
              exit={{ scale: 2, opacity: 0.2 }}
              initial="hidden"
              animate={loaded ? "visible" : "hidden"}
            >
              <motion.div
                variants={{
                  hidden: { scale: 0, opacity: 0 },
                  visible: {
                    scale: 1,
                    opacity: 1,
                    transition: { duration: 0.3 },
                  },
                }}
                className="shadow-slate-900 shadow-lg"
              >
                <OpponentMugshotMinimal
                  opponent={scene.opponent}
                  onLoad={() => setLoaded(true)}
                />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </SceneLayout>
  );
}

function SceneShop({ scene, statefn }: { scene: Scene; statefn: StateFnT }) {
  const [clicked, setClicked] = useState(false);
  const [shop, returnHandler] = useStateShim(
    scene,
    scene.shop as Shop,
    SetShop,
    statefn,
  );

  if (!scene.shop) {
    return <></>;
  }

  const clickfn = () => {
    if (clicked) {
      return;
    }

    setClicked(true);
  };

  return (
    <SceneLayout title="A Trader">
      {(!clicked && (
        <motion.button
          key="explore-button"
          className="flex flex-row self-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 1.5 }}
          whileTap={{ scale: 0.9 }}
          onClick={clickfn}
        >
          <OnDarkGlass>
            <Image
              src={`/portrait/dark/${scene.shop.image}`}
              alt="Picture of a trader"
              width={320}
              height={320}
            />
          </OnDarkGlass>
        </motion.button>
      )) || <PlayShop shop={scene.shop} handleReturn={returnHandler} />}
    </SceneLayout>
  );
}

function SceneBattle({ scene, statefn }: { scene: Scene; statefn: StateFnT }) {
  const [battle, returnHandler] = useStateShim(
    scene,
    scene.battle as Battle,
    SetBattle,
    statefn,
  );

  if (!battle) {
    return <></>;
  }

  return <PlayBattle battle={battle} handleReturn={returnHandler} />;
}

function SceneLost({ scene, statefn }: { scene: Scene; statefn: StateFnT }) {
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

function SceneBattleLoot({
  scene,
  statefn,
}: {
  scene: Scene;
  statefn: StateFnT;
}) {}

function PlaySceneContent({
  scene,
  statefn,
}: {
  scene: Scene;
  statefn: StateFnT;
}) {
  if (scene.intro) {
    return <SceneExplore scene={scene} statefn={statefn} />;
  }

  if (scene.battle) {
    return <SceneBattle scene={scene} statefn={statefn} />;
  }

  if (scene.opponent) {
    return <SceneOpponent scene={scene} statefn={statefn} />;
  }

  if (scene.lost) {
    return <SceneLost scene={scene} statefn={statefn} />;
  }

  if (scene.battleloot) {
    // loot interaction
    return (
      <SceneLayout title="The Spoils of Battle!">
        <DrawLootContainer
          key="battleloot"
          loot={scene.battleloot}
          claimfn={async () => await statefn(await TakeBattleLootItem(scene))}
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
          claimfn={async () => await statefn(await TakeLootItem(scene))}
        />
      </SceneLayout>
    );
  }

  if (scene.shop) {
    return <SceneShop key="shop" scene={scene} statefn={statefn} />;
  }

  const choose = async (key: string) =>
    await statefn(await ChooseConnection(scene, key));
  return <DrawConnections scene={scene} choosefn={choose} />;
}

function DrawConnections({
  scene,
  choosefn,
}: {
  scene: Scene;
  choosefn: (key: string) => Promise<void>;
}) {
  const [clicked, setClicked] = useState("");
  const clickfn = async (location: string) => {
    if (clicked != "") {
      return;
    }

    await setClicked(location);
    await choosefn(location);
  };

  return (
    <SceneLayout title="Choose Your Path">
      <div className="flex-1 flex flex-col justify-evenly items-center gap-2 backdrop-blur-sm">
        <AnimatePresence>
          {(clicked === "" &&
            GetConnectedLocations(scene).map((location) => (
              <DrawLocationPreview
                key={location}
                location={location}
                clickHandler={() => clickfn(location)}
              />
            ))) || (
            <DrawLocationPreview
              key={clicked}
              location={clicked}
              clickHandler={() => clickfn(clicked)}
              picked
            />
          )}
        </AnimatePresence>
      </div>
    </SceneLayout>
  );
}

function DrawLocationPreview({
  location,
  clickHandler,
  picked,
}: {
  location: string;
  clickHandler: () => Promise<void>;
  picked?: boolean;
}) {
  return (
    <motion.button
      layoutId={location}
      onClick={clickHandler}
      initial={{ scale: 0 }}
      animate={{ scale: picked ? 1.5 : 1 }}
      whileTap={{ scale: 0.9 }}
      exit={{ opacity: 0 }}
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
  picked,
}: {
  location: string;
  children: React.ReactNode;
  picked?: boolean;
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
