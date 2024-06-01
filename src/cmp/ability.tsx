import { useState } from "react";

import type { AbilityCard } from "@/lib/ability";

type AbilityFnT = (s: string) => Promise<void>;

export function AbilityCarousel({
  abilities,
  statefn,
  closefn,
}: {
  abilities: Map<string, AbilityCard>;
  statefn: AbilityFnT;
  closefn: () => void;
}) {
  const [idx, setIdx] = useState(0);
  if (abilities.size === 0) {
    return <></>;
  }

  let keys: string[] = [];
  for (const [k, v] of abilities) {
    keys.push(k);
  }
  const ability = abilities.get(keys[idx]) as AbilityCard;
  const canuse = ability.ok && ability.uses > 0;
  const use = async () => await statefn(keys[idx]);

  const buttoncn = "py-0.5 px-2 rounded-lg";
  return (
    <div className="flex flex-col gap-1 text-black">
      <div className="flex-1 flex flex-col bg-orange-200 p-1">
        <div className="flex flex-row gap-1 items-baseline">
          <h1 className="text-2xl">{ability.name}</h1>
          <div className="italic">{ability.uses} uses remaining</div>
        </div>
        <p className="">{ability.desc}</p>
      </div>

      <div className="self-stretch grid grid-cols-5 gap-1">
        <button
          className={`${buttoncn} col-start-1 bg-red-500`}
          onClick={closefn}
        >
          Back
        </button>

        {idx > 0 && (
          <button
            className={`${buttoncn} col-start-2 bg-amber-300`}
            onClick={() => setIdx(idx - 1)}
          >
            Prev
          </button>
        )}

        {idx + 1 !== keys.length && (
          <button
            className={`${buttoncn} col-start-3 bg-amber-300`}
            onClick={() => setIdx(idx + 1)}
          >
            Next
          </button>
        )}

        {canuse ? (
          <button
            className={`${buttoncn} col-start-4 col-span-2 bg-lime-500`}
            onClick={use}
          >
            Use
          </button>
        ) : (
          <button
            className={`${buttoncn} col-start-4 col-span-2 bg-neutral-500`}
          >
            Use
          </button>
        )}
      </div>
    </div>
  );
}

export function DrawAbility({ ability }: { ability: AbilityCard }) {
  return (
    <div key={ability.name} className="flex flex-col gap-1">
      <h1 className="text-xl font-bold">{ability.name}</h1>
      <div className="italic">{ability.desc}</div>
    </div>
  );
}
