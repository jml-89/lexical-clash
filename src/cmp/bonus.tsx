import { useState } from "react";
import type { BonusCard } from "@/lib/bonus";

import { SquishyButton, OnDarkGlass } from "./misc";

export function BonusCarousel({
  bonuses,
  closefn,
}: {
  bonuses: Map<string, BonusCard>;
  closefn: () => void;
}) {
  const [idx, setIdx] = useState(0);
  if (bonuses.size === 0) {
    return <></>;
  }

  let keys: string[] = [];
  for (const [k, v] of bonuses) {
    keys.push(k);
  }
  const bonus = bonuses.get(keys[idx]) as BonusCard;
  return (
    <div className="flex flex-col gap-1 text-white">
      <OnDarkGlass className="p-1 bg-green-400/50 shadow-none">
        <DrawBonus bonus={bonus} />
      </OnDarkGlass>

      <div className="self-stretch grid grid-cols-3 gap-1">
        <div className="col-start-1 grid">
          <SquishyButton onClick={closefn}>
            <OnDarkGlass className="bg-red-400/50">Back</OnDarkGlass>
          </SquishyButton>
        </div>

        {idx > 0 && (
          <div className="col-start-2 grid">
            <SquishyButton onClick={() => setIdx(idx - 1)} manyClick>
              <OnDarkGlass className="bg-yellow-300/50">Prev</OnDarkGlass>
            </SquishyButton>
          </div>
        )}

        {idx + 1 !== keys.length && (
          <div className="col-start-3 grid">
            <SquishyButton onClick={() => setIdx(idx + 1)} manyClick>
              <OnDarkGlass className="bg-yellow-300/50">Next</OnDarkGlass>
            </SquishyButton>
          </div>
        )}
      </div>
    </div>
  );
}

export function DrawBonus({ bonus }: { bonus: BonusCard }) {
  return (
    <div key={bonus.name} className="flex flex-col">
      <div className="flex flex-row justify-between gap-2 items-start">
        <div className="text-xl font-bold">{bonus.name}</div>
        <div className="text-sm">
          <span className="font-bold">Level {bonus.level}:</span>
          {" +"}
          {bonus.weight * bonus.level} points
        </div>
      </div>
      <div className="text-sm italic">{bonus.desc}</div>
    </div>
  );
}
