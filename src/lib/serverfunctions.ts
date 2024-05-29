"use server";

export async function ServerSeed(): Promise<number> {
  return Date.now();
}
