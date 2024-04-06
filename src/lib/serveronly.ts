"use server"

export async function serverSeed(): Promise<number> {
	return Date.now()
}
