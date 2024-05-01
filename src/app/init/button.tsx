"use client";

import { useState } from "react";

export function BigButton({
  msg,
  msgpressed,
  fn,
}: {
  msg: string;
  msgpressed: string;
  fn: () => Promise<void>;
}) {
  const [up, setUp] = useState(true);

  const xn = async (): Promise<void> => {
    setUp(false);
    await fn();
    setUp(true);
  };

  const btn = up ? (
    <button
      className="p-2 m-2 rounded-lg bg-slate-700 text-lg text-amber-300"
      onClick={xn}
    >
      {msg}
    </button>
  ) : (
    <button className="p-2 m-2 rounded-lg bg-slate-700 text-lg text-amber-300">
      {msgpressed}
    </button>
  );

  return <main className="flex flex-col items-center">{btn}</main>;
}
