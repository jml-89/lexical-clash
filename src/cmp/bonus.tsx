import { useState } from "react";
import type { BonusCard } from "@/lib/bonus";

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
    <div className="flex flex-col gap-1">
      <div className="flex-1 flex flex-col items-baseline bg-orange-200 p-1">
        <div className="flex flex-row items-baseline gap-1">
          <h1 className="text-xl">{bonus.name}</h1>
          <div className="italic">
            Level {bonus.level} (+{bonus.level * bonus.weight} points)
          </div>
        </div>
        <p className="">{bonus.desc}</p>
      </div>

      <div className="self-stretch grid grid-cols-5 gap-1">
        <button
          className="col-start-1 bg-red-500 py-0.5 px-2 rounded-lg"
          onClick={closefn}
        >
          Back
        </button>

        {idx > 0 && (
          <button
            className="col-start-2 bg-amber-300 py-0.5 px-2 rounded-lg"
            onClick={() => setIdx(idx - 1)}
          >
            Prev
          </button>
        )}

        {idx + 1 !== keys.length && (
          <button
            className="col-start-3 bg-amber-300 py-0.5 px-2 rounded-lg"
            onClick={() => setIdx(idx + 1)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
