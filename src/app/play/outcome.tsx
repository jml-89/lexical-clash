'use client'

import { NextPreamble } from '@/lib/game.ts'

export function Outcome({ phase, statefn }) {
	async function nextPreamble(choices) {
		await statefn((g, s) => NextPreamble(g, s));
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
				, "bg-gradient-to-b from-amber-500 via-amber-500 to-amber-500"
				, "flex flex-col gap-6"
				, "place-content-center place-items-center"
				, "p-4"
				].join(' ')}
			>
				<h1 className="text-3xl font-bold">
					Congratulations!
				</h1>

				<button onClick={nextPreamble}>
					Continue
				</button>
			</div>
		</main>
	);
}

