import Image from "next/image";

import { memo } from "react";
import { motion } from "framer-motion";

import type { Opponent } from "@/lib/opponent";
import type { ComBattler } from "@/lib/battler";

import { HealthBar } from "@/cmp/misc";
import { DrawLetters } from "@/cmp/letter";

export const DrawComBattler = memo(function DrawComBattler({
  opp,
}: {
  opp: ComBattler;
}) {
  const hd = opp.healthMax - opp.health;
  return (
    <motion.div className="flex flex-col items-center gap-2">
      <HealthBar badguy={true} health={opp.health} healthMax={opp.healthMax} />

      <DrawProfile opp={opp.profile} hd={hd} />

      <motion.div initial={{ y: -100 }} animate={{ y: 0 }}>
        <DrawLetters letters={opp.playArea.placed} />
      </motion.div>
    </motion.div>
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
    <div className="flex flex-row gap-4">
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
          src={`/${opp.image}`}
          width={80}
          height={80}
          alt={`Mugshot of ${opp.name}`}
        />
      </motion.div>

      <div className="flex flex-col">
        <div className="text-amber-300">
          <span className="text-lg font-bold">{opp.name}</span>{" "}
          <span className="italic">(Level {opp.level})</span>
        </div>
        <div className="text-red-300">
          <span className="font-bold">Uses:</span> {opp.strength.join(", ")}
        </div>
        <div className="text-lime-300">
          <span className="font-bold">Weak to:</span> {opp.weakness.join(", ")}
        </div>
      </div>
    </div>
  );
});

export function OpponentMugshot({ opponent }: { opponent: Opponent }) {
  return (
    <div key={opponent.name} className="flex flex-row gap-1">
      <div className="flex-none">
        <Image
          src={`/${opponent.image}`}
          width={120}
          height={120}
          alt={`Mugshot of ${opponent.name}`}
        />
      </div>

      <div className="flex flex-col justify-between items-baseline text-left">
        <h1 className="text-amber-300 text-xl">{opponent.name}</h1>
        <div className="text-amber-300 italic">
          Level {opponent.level} {opponent.desc}
        </div>

        <div className="text-red-300">
          <span className="font-bold">Uses:</span>{" "}
          {opponent.strength.join(", ")}
        </div>
        <div className="text-lime-300">
          <span className="font-bold">Weak to:</span>{" "}
          {opponent.weakness.join(", ")}
        </div>
      </div>
    </div>
  );
}
