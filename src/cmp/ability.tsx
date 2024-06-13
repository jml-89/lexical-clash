import { useState } from "react";

import type { AbilityCard } from "@/lib/ability";

import { TapGlass, OnDarkGlass } from "./misc";

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
    <div className="flex flex-col gap-1 text-white">
      <OnDarkGlass className="p-1 bg-green-400/50 shadow-none">
        <DrawAbility ability={ability} />
      </OnDarkGlass>

      <div className="self-stretch grid grid-cols-4 gap-1">
        <div className="col-start-1 grid">
          <TapGlass onClick={closefn} className="bg-red-400/50">
            Back
          </TapGlass>
        </div>

        {idx > 0 && (
          <div className="col-start-2 grid">
            <TapGlass
              onClick={() => setIdx(idx - 1)}
              repeat
              className="bg-yellow-300/50"
            >
              Prev
            </TapGlass>
          </div>
        )}

        {idx + 1 !== keys.length && (
          <div className="col-start-3 grid">
            <TapGlass
              onClick={() => setIdx(idx + 1)}
              repeat
              className="bg-yellow-300/50"
            >
              Next
            </TapGlass>
          </div>
        )}

        <div className="col-start-4 grid">
          {canuse ? (
            <TapGlass onClick={use} repeat className="bg-lime-300/75">
              Use
            </TapGlass>
          ) : (
            <TapGlass className="bg-neutral-300/50" repeat>
              Use
            </TapGlass>
          )}
        </div>
      </div>
    </div>
  );
}

export function DrawAbility({ ability }: { ability: AbilityCard }) {
  return (
    <div key={ability.name} className="flex-1 flex flex-col items-stretch">
      <div className="flex flex-row justify-between gap-2 items-start">
        <h1 className="flex-1 text-start text-xl font-bold">{ability.name}</h1>
        <div className="text-sm">Ability</div>
        <div className="text-sm">{ability.uses} charges</div>
      </div>
      <div className="text-sm italic self-baseline">{ability.desc}</div>
    </div>
  );
}
