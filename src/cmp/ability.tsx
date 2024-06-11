import { useState } from "react";

import type { AbilityCard } from "@/lib/ability";

import { TapGlass, SquishyButton, OnDarkGlass } from "./misc";

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

        <div className="col-start-4 grid">
          {canuse ? (
            <SquishyButton onClick={use} manyClick>
              <OnDarkGlass className="bg-lime-300/75">Use</OnDarkGlass>
            </SquishyButton>
          ) : (
            <SquishyButton>
              <OnDarkGlass className="bg-neutral-300/50">Use</OnDarkGlass>
            </SquishyButton>
          )}
        </div>
      </div>
    </div>
  );
}

export function DrawAbility({ ability }: { ability: AbilityCard }) {
  return (
    <div key={ability.name} className="flex flex-col">
      <div className="flex flex-row justify-between gap-2 items-start">
        <h1 className="text-xl font-bold">{ability.name}</h1>
        <div>{ability.uses} uses remaining</div>
      </div>
      <div className="text-sm italic">{ability.desc}</div>
    </div>
  );
}
