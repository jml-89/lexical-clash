'use client'

import { useState } from 'react';
import { WithCopy, EndPreamble } from '@/lib/game.ts';
import Image from 'next/image';

export function Preamble({ phase, statefn }) {
	const [choices, setChoices] = useState({
		opponents: '',
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
			title: "Select Your Opponent",
			options: mugshots,
			field: 'opponents',
			apply: (key: string): void => {
				choices.opponents = key
				setChoices(choices)
				setStageidx(stageidx + 1)
			}
		},
		{
			title: "Select Ability",
			options: abticks,
			field: 'abilities',
			apply: (key: string): void => {
				choices.abilities.push(key)
				setChoices(choices)
				setStageidx(stageidx + 1)
			}
		},
		{
			title: "Select Bonus",
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
		<Selection 
			title={stage.title} 
			options={options}
		/>
	);
}

function Selection({ title, options }) {
	return (
		<main className="flex-1 flex flex-col justify-start gap-2 mx-2">
			<h1 className="text-amber-300 text-4xl font-light">
				{title}
			</h1>

			{options}
		</main>
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
	let tableData: string[][] = []
	for (const weakness of opponent.weaknesses) {
		tableData.push([weakness, ''])
	}

	for (const [i, strength] of opponent.strengths.entries()) {
		if (i < tableData.length) {
			tableData[i][1] = strength
		} else {
			tableData.push(['', strength])
		}
	}

	return (
		<div key={opponent.name} 
			className={[
				"flex flex-col",
				"rounded-xl",
				"bg-slate-700",
				"p-2 gap-2"
			].join(' ')}
		>

			<h1 className="text-amber-300 text-xl">{opponent.name} <span className="italic">({opponent.desc})</span></h1>
			
			<div className="flex flex-row gap-2">
				<Image 
					src={`/${opponent.image}`} 
					width={120}
					height={120}
					alt={`Mugshot of ${opponent.name}`}
				/>

				<div className="flex flex-col">
					<div className="text-lime-300"><span className="font-bold">Weak to:</span> {opponent.weaknesses.join(', ')}</div>
					<div className="text-red-300"><span className="font-bold">Strong against:</span> {opponent.strengths.join(', ')}</div>
				</div>
			</div>
		</div>
	);
}

function AbilityTicket({ ability }) {
	return (
		<div key={ability.name} 
			className={[
				"flex flex-col",
				"rounded-xl",
				"bg-slate-700",
				"text-amber-300",
				"p-2 gap-2"
			].join(' ')}
		>
			<h1 className="text-xl font-bold">{ability.name}</h1>
			<div className="italic">{ability.desc}</div>
		</div>
	);
}

function BonusTicket({ bonus }) {
	return (
		<div key={bonus.name} 
			className={[
				"flex flex-col",
				"rounded-xl",
				"bg-slate-700",
				"text-amber-300",
				"p-2 gap-2"
			].join(' ')}
		>
			<h1 className="text-xl font-bold">{bonus.name}</h1>
			<div className="italic">{bonus.desc}</div>
		</div>
	);
}
