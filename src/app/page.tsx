"use client"; //animations

import Link from "next/link";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import type { Letter } from "@/lib/letter";
import { stringToLetters } from "@/lib/letter";
import { DrawLetter } from "@/cmp/letter";
import { delay } from "@/cmp/misc";

function DrawTitle() {
  const [state, setState] = useState({
    title: stringToLetters("title", "LexicalClash"),
    idx: 0,
  });

  const promoteLetter = (letter: Letter): Letter => {
    return {
      ...letter,
      bonus: (letter.bonus + 1) % 9,
    };
  };

  useEffect(() => {
    const fn = async () => {
      await delay(150);

      let newTitle = [...state.title];
      newTitle[state.idx] = promoteLetter(newTitle[state.idx]);

      setState({
        title: newTitle,
        idx: (state.idx + 1) % state.title.length,
      });
    };

    fn();
  });

  const letters = state.title.map((letter) => (
    <DrawLetter key={letter.id} letter={letter} />
  ));
  const midpoint = "Lexical".length;
  const r1 = letters.slice(0, midpoint);
  const r2 = letters.slice(midpoint);

  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="flex flex-row gap-1">{r1}</div>
      <div className="flex flex-row gap-1">{r2}</div>
    </div>
  );
}

export default function Intro() {
  return (
    <main className="flex-1 flex flex-col bg-[url('/bg/main.jpg')] bg-center bg-cover">
      <div className="flex-1 flex flex-col self-stretch justify-center items-center gap-4 backdrop-brightness-50">
        <DrawTitle />
        <FatLink href="/play">Adventure</FatLink>
        <FatLink href="/about">About</FatLink>
      </div>
    </main>
  );
}

function FatLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="p-4 text-4xl text-white font-light tracking-tight backdrop-blur-lg bg-black/50 rounded-lg border border-black shadow-lg shadow-slate-900"
      href={href}
    >
      {children}
    </Link>
  );
}
