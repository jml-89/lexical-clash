'use client'

import { Outcome, EndOutcome } from '@/lib/game'

export function ShowOutcome({ outcome, statefn }: {
	outcome: Outcome,
	statefn: (fn: (p: Outcome) => void) => Promise<void> 
}) {
	async function endOutcome() {
		await statefn((g: Outcome) => EndOutcome(g))
	};

	const [title, body, reward, ] = outcome.victory ?
		[
			"Congratulations!", 
			`You defeated ${outcome.opponent.name}`,
			`${outcome.letterUpgrades} randomly selected letters have been upgraded`
		] : [
			"Commiserations..", 
			`You were defeated by ${outcome.opponent.name}`,
			"Nonetheless, you may continue your quest"
		]

	return (
		<main className="flex flex-col justify-center items-center">
			<div className={
				[ "rounded-lg"
				, "bg-slate-700"
				, "text-amber-300"
				, "flex flex-col items-center gap-2"
				, "p-4 m-4"
				].join(' ')}
			>
				<h1 className="text-4xl font-light tracking-tighter">
					{title}
				</h1>

				<div>{body}</div>

				<div>{reward}</div>

				<button className="p-2 rounded-lg text-2xl bg-lime-600 text-amber-100" onClick={endOutcome}>
					Continue
				</button>
			</div>
		</main>
	);
}

