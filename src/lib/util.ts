// util
// Mandatory potpourri of functions that I can't find a more suitable home for
import prand from "pure-rand";

// Mutator is just the interface created by CreateMutator's return
// CreateMutator is the interesting one
interface Mutator<T> {
  get: () => T;
  set: (fn: (t: T) => Promise<void>) => Promise<void>;
}

// World's simplest closure implementation
// This closes over the parameter $g and returns a getter/setter
// The reason this is useful is the get/set function objects do not change with g
// So when the setter is passed in props, React sees the same function object ever render -- good for memoisation
// This is only intended to be used for the Preamble/Battle/Outcome phases
// That's what the less obvious $endfn parameter is for, the function called from GameState to change phase
export function CreateMutator<T>(
  g: T,
  setfn: (t: T) => void,
  endfn: (t: T) => Promise<void>,
): Mutator<T> {
  let c = { ...g };

  return {
    get: () => c,
    set: async (fn: (t: T) => Promise<void>): Promise<void> => {
      c = { ...c };
      await fn(c);
      setfn(c);
      await endfn(c);
    },
  };
}

// This was dumped here just so it's safe to import anywhere
// Really, belongs in wordnet.ts, but that's server-only
export interface KnowledgeBase {
  valid: (word: string) => Promise<boolean>;
  related: (relation: string, left: string, right: string) => Promise<boolean>;
  rescore: (
    words: ScoredWord[],
    bonuses: BonusQuery[],
  ) => Promise<ScoredWord[]>;
  hypos: (word: string) => Promise<ScoredWord[]>;
  candidates: (
    lo: number,
    hi: number,
    maxlen: number,
    num: number,
  ) => Promise<HyperSet[]>;
  save: (id: string, o: string) => Promise<void>;
}

export interface ScoredWord {
  word: string;
  base: number;
  score: number;
}

export interface BonusQuery {
  query: string;
  score: number;
}

export interface HyperSet {
  hypernym: string;
  definitions: string[];
  hyponyms: ScoredWord[];
}

export type PRNG = (lo: number, hi: number) => number;

export interface RandState {
  seed: number;
  iter: number;
}

export function CreateStatefulRand(seed: number): [RandState, PRNG] {
  let step = prand.xoroshiro128plus(seed);
  let state = { seed: seed, iter: 0 };
  return [
    state,
    (lo: number, hi: number): number => {
      const [res, next] = prand.uniformIntDistribution(lo, hi, step);
      step = next;
      state.iter += 1;

      return res;
    },
  ];
}

export function PickRandom<T>(
  prng: PRNG,
  m: Map<string, T>,
  n: number,
): Map<string, T> {
  const res = new Map<string, T>();
  const keys = Shuffle(prng, [...m.keys()]);

  for (const key of keys.slice(0, n)) {
    res.set(key, m.get(key) as T);
  }

  return res;
}

export function Shuffle<T>(prng: PRNG, xs: T[]): T[] {
  let ys = new Array(xs.length);

  for (const [i, x] of xs.entries()) {
    const j = prng(0, i);
    if (j !== i) {
      ys[i] = ys[j];
    }
    ys[j] = x;
  }

  return ys;
}

export function ShuffleMap<T1, T2>(prng: PRNG, xs: Map<T1, T2>): Map<T1, T2> {
  let keys = Shuffle(prng, [...xs.keys()]);
  let res = new Map<T1, T2>();
  for (const key of keys) {
    const v = xs.get(key);
    if (v !== undefined) {
      res.set(key, v);
    }
  }
  return res;
}

export function MapConcat<T1, T2>(
  m1: Map<T1, T2>,
  m2: Map<T1, T2>,
): Map<T1, T2> {
  let xs = new Map<T1, T2>();
  for (const [k, v] of m1) {
    xs.set(k, v);
  }
  for (const [k, v] of m2) {
    xs.set(k, v);
  }
  return xs;
}

// naive Levenshtein distance implementation
export function distance(x: string, y: string): number {
  let v0: Array<number> = Array(y.length + 1).fill(0);
  let v1: Array<number> = Array(y.length + 1).fill(0);
  for (let i = 0; i < v0.length; i++) {
    v0[i] = i;
  }

  for (let i = 0; i < x.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < y.length; j++) {
      const del = v0[j + 1] + 1;
      const ins = v1[j] + 1;
      const sub = x[i] === y[j] ? v0[j] : v0[j] + 1;
      v1[j + 1] = Math.min(del, ins, sub);
    }

    for (let k = 0; k < v0.length; k++) {
      v0[k] = v1[k];
    }
  }

  return v0[v0.length - 1];
}

export function CopyMap<K, T>(m: Map<K, T>): Map<K, T> {
  let cp = new Map<K, T>();
  for (const [k, v] of m) {
    cp.set(k, { ...v });
  }
  return cp;
}
