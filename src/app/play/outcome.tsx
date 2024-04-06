'use client'

import { EndOutcome } from '@/lib/game.ts'

export function Outcome({ phase, statefn }) {
	async function nextPreamble(choices) {
		await statefn((g, s) => EndOutcome(g, s));
	};

	return (
		<main className={
			[ "h-svh"
			, "flex flex-col"
			, "place-content-center place-items-center"
			].join(' ')}
		>
			<div className={
				[ "rounded-3xl"
				, "bg-slate-800"
				, "text-amber-300"
				, "flex flex-col gap-6"
				, "place-content-center place-items-center"
				, "p-4"
				].join(' ')}
			>
				<h1 className="text-3xl font-bold">
					Congratulations!
				</h1>

				<div>Five randomly selected letters have been upgraded</div>

				<button className="p-2 rounded-lg bg-lime-600 text-amber-100" onClick={nextPreamble}>
					Continue
				</button>
			</div>
		</main>
	);
}

