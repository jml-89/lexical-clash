"use client";

import { useRef, useState, useCallback } from "react";
import { Outcome, EndOutcome } from "@/lib/game";
import { CreateMutator } from "@/lib/util";

import { motion } from "framer-motion";

export function ShowOutcome({
  outcome,
  endfn,
}: {
  outcome: Outcome;
  endfn: (o: Outcome) => Promise<void>;
}) {
  const [myOutcomeX, setMyOutcomeX] = useState(outcome);
  const mutator = useRef(CreateMutator(myOutcomeX, setMyOutcomeX, endfn));
  const myOutcome = mutator.current.get();
  const statefn = mutator.current.set;

  async function endOutcome() {
    await statefn(async (g: Outcome) => await EndOutcome(g));
  }

  return <ShowBasicOutcome outcome={myOutcome} endOutcome={endOutcome} />;
}

function ShowBasicOutcome({
  outcome,
  endOutcome,
}: {
  outcome: Outcome;
  endOutcome: () => Promise<void>;
}) {
  const [title, body, reward] = outcome.victory
    ? outcome.opponent.key === "player"
      ? [
          "Your Journey Begins",
          "Pick your opponents, abilities, bonuses, and words wisely",
          `You have been granted ${outcome.letterUpgrades} upgraded letters to start with`,
        ]
      : outcome.opponent.isboss
        ? [
            "You Win!",
            `You defeated the final boss, ${outcome.opponent.name}`,
            `You can keep playing if you wish, all opponents will now be scaled to your level`,
          ]
        : [
            "Congratulations!",
            `You defeated ${outcome.opponent.name}`,
            `${outcome.letterUpgrades} randomly selected letters have been upgraded`,
          ]
    : [
        "Commiserations..",
        `You were defeated by ${outcome.opponent.name}`,
        "Nonetheless, you may continue your quest",
      ];

  return (
    <main className="flex flex-col justify-center items-center">
      <motion.div
        className={[
          "rounded-lg shadow-2xl",
          "bg-slate-700",
          "text-amber-300",
          "flex flex-col items-center gap-2",
          "p-4 m-4",
        ].join(" ")}
        initial={{ rotate: -5, x: -30, y: -30 }}
        animate={{ rotate: 0, x: 0, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-light tracking-tighter">{title}</h1>

        <div>{body}</div>

        <div>{reward}</div>

        {outcome.done ? (
          <div className="p-2 rounded-lg text-2xl bg-lime-600 text-amber-100">
            Loading...
          </div>
        ) : (
          <motion.button
            className="p-2 rounded-lg text-2xl bg-lime-600 text-amber-100"
            whileHover={{
              scale: 1.2,
            }}
            whileTap={{
              scale: 0.9,
            }}
            onClick={endOutcome}
          >
            Continue
          </motion.button>
        )}
      </motion.div>
    </main>
  );
}
