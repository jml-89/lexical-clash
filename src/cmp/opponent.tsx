import Image from "next/image";

import { memo } from "react";
import { motion } from "framer-motion";

import type { Opponent } from "@/lib/opponent";
import type { ComBattler } from "@/lib/battler";

import { HealthBar, OnDarkGlass } from "@/cmp/misc";
import { DrawScoresheet } from "@/cmp/score";
import { DrawLetters } from "@/cmp/letter";

export const DrawComBattler = memo(function DrawComBattler({
  opp,
}: {
  opp: ComBattler;
}) {
  const hd = opp.healthMax - opp.health;
  return (
    <motion.div className="self-stretch flex flex-col items-center gap-2">
      <div className="self-stretch flex flex-row gap-1">
        <DrawProfile opp={opp.profile} hd={hd} />

        <div className="flex-1 flex flex-col">
          <HealthBar
            badguy={true}
            health={opp.health}
            healthMax={opp.healthMax}
          />
          <DrawInfo opp={opp.profile} />
        </div>
      </div>

      <motion.div initial={{ y: -100 }} animate={{ y: 0 }}>
        <DrawLetters
          letters={opp.playArea.placed}
          small={opp.playArea.placed.length > 10}
        />
      </motion.div>
    </motion.div>
  );
});

const DrawInfo = memo(function DrawInfo({ opp }: { opp: Opponent }) {
  return (
    <div className="flex flex-col">
      <div className="text-amber-300 flex flex-row gap-1 items-baseline">
        <span className="text-lg font-bold">{opp.name}</span>
        <span className="italic">
          (Level {opp.level} {opp.memberof})
        </span>
      </div>
      <div className="flex flex-row items-baseline gap-2">
        <div className="text-lime-300">
          <span className="font-bold">Weak to:</span> {opp.weakness}
        </div>
        <div className="text-red-300">
          <span className="font-bold">Uses:</span> {opp.strength}
        </div>
      </div>
    </div>
  );
});

const DrawProfile = memo(function DrawProfile({
  opp,
  hd,
}: {
  opp: Opponent;
  hd: number;
}) {
  return (
    <div className="flex flex-row gap-2">
      <motion.div
        className="flex-none"
        initial={{
          rotate: 0,
          scale: 0,
        }}
        animate={{
          rotate: [0, -hd, hd, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 0.2,
          repeat: hd,
        }}
      >
        <Image
          src={`/portrait/dark/${opp.image}`}
          width={80}
          height={80}
          alt={`Mugshot of ${opp.name}`}
        />
      </motion.div>
    </div>
  );
});

export function OpponentMugshotHorizontal({
  opponent,
}: {
  opponent: Opponent;
}) {
  return (
    <div key={opponent.name} className="flex flex-row gap-1">
      <div className="flex-none">
        <Image
          src={`/portrait/dark/${opponent.image}`}
          width={120}
          height={120}
          alt={`Mugshot of ${opponent.name}`}
        />
      </div>

      <div className="flex flex-col justify-between items-baseline text-left">
        <h1 className="text-amber-300 text-xl">{opponent.name}</h1>
        <div className="text-amber-300 italic">
          Level {opponent.level} {opponent.memberof}
        </div>

        <div className="text-red-300">
          <span className="font-bold">Uses:</span> {opponent.strength}
        </div>
        <div className="text-lime-300">
          <span className="font-bold">Weak to:</span> {opponent.weakness}
        </div>
      </div>
    </div>
  );
}

export function OpponentMugshotMinimal({
  opponent,
  onLoad,
}: {
  opponent: Opponent;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
}) {
  return (
    <Image
      src={`/portrait/dark/${opponent.image}`}
      width={320}
      height={320}
      alt={`Mugshot of ${opponent.name}`}
      onLoad={onLoad}
    />
  );
}

export function OpponentMugshotVertical({ opponent }: { opponent: Opponent }) {
  return (
    <div key={opponent.name} className="flex flex-col gap-1 items-center">
      <h1 className="text-2xl">{opponent.name}</h1>
      <Image
        src={`/portrait/dark/${opponent.image}`}
        width={320}
        height={320}
        alt={`Mugshot of ${opponent.name}`}
      />

      <div className="text-amber-300 italic">
        Level {opponent.level} {opponent.memberof}
      </div>
    </div>
  );
}
