'use client'

import { useState } from 'react';
import { WithCopy, EndPreamble } from '@/lib/game.ts';

export function Preamble({ phase, statefn }) {
	const [choices, setChoices] = useState({
		abilities: [],
		bonuses: []
	});
	const [stageidx, setStageidx] = useState(0);

	async function endPreamble(choices) {
		await statefn((g, s) => EndPreamble(g, s, choices));
	};

	const mugshots = new Map<string, any>();
	for (const [key, opponent] of phase.opponents) {
		mugshots.set(key, OpponentMugshot({ opponent: opponent }))
	}
	const abticks = new Map<string, any>()
	for (const [key, ability] of phase.abilities) {
		abticks.set(key, AbilityTicket({ ability: ability }))
	}

	const boticks = new Map<string, any>()
	for ( const [key, bonus] of phase.bonuses) {
		boticks.set(key, BonusTicket({ bonus: bonus }))
	}

	const stages = [
		{
			title: "(1/3) Pick Opponent",
			options: mugshots,
			field: 'opponents',
			apply: (key: string): void => {
				setChoices({...choices, opponents: key})
				setStageidx(stageidx + 1)
			}
		},
		{
			title: "(2/3) Pick an Ability",
			options: abticks,
			field: 'abilities',
			apply: (key: string): void => {
				choices.abilities.push(key)
				setChoices(choices)
				setStageidx(stageidx + 1)
			}
		},
		{
			title: "(3/3) Pick a Bonus",
			options: boticks,
			field: 'bonuses',
			apply: (key: string): void => {
				choices.bonuses.push(key)
				endPreamble(choices)
			}
		}
	];

	const stage = stages[stageidx];

	const toOptionTile = ([k, v]) => {
		const params = {
			key: k, 
			children: v, 
			handler: stage.apply
		};
		return OptionTile(params);
	}

	let options = []
	for (const [k, v] of stage.options) {
		options.push(toOptionTile([k, v]))
	}
	
	return (
		<main className={
			[ "h-svh"
			, "flex flex-col"
			, "place-content-center place-items-center"
			].join(' ')}
		>
			<Selection 
				title={stage.title} 
				options={options}
			/>
		</main>
	);
}

function Selection({ title, options }) {
	return (
		<div className={
			[ "rounded-3xl"
			, "bg-gradient-to-b from-amber-500 via-amber-500 to-amber-500"
			, "flex flex-col gap-6"
			, "place-content-center place-items-center"
			, "p-4"
			].join(' ')}
		>
			<h1 className="text-3xl font-bold">
				{title}
			</h1>

			{options}
		</div>
	);
}

function Nothing({ arg }) {
	return (<div></div>);
}

function OptionTile({ key, children, handler }) {
	return (
		<button key={key} onClick={() => handler(key)}>
			{children}
		</button>
	);
}

function OpponentMugshot({ opponent }) {
	return (
		<div key={opponent.name} 
			className={[
				"flex flex-col",
				"rounded-xl",
				"bg-gradient-to-b from-red-400 via-red-400 to-red-500",
				"p-4"
			].join(' ')}
		>
			<h1 className="text-xl font-bold">{opponent.name}</h1>
			<p>{opponent.desc}</p>
		</div>
	);
}

function AbilityTicket({ ability }) {
	return (
		<div key={ability.name} 
			className={[
				"flex flex-col",
				"rounded-xl",
				"bg-gradient-to-b from-red-400 via-red-400 to-red-500",
				"p-4"
			].join(' ')}
		>
			<h1 className="text-xl font-bold">{ability.name}</h1>
			<p>{ability.desc}</p>
		</div>
	);
}

function BonusTicket({ bonus }) {
	return (
		<div key={bonus.name} 
			className={[
				"flex flex-col",
				"rounded-xl",
				"bg-gradient-to-b from-red-400 via-red-400 to-red-500",
				"p-4"
			].join(' ')}
		>
			<h1 className="text-xl font-bold">{bonus.name}</h1>
			<p>{bonus.desc}</p>
		</div>
	);
}
