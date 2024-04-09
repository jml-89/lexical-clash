'use client'

import { useState } from 'react';
import Image from 'next/image';

import { 
	Preamble, 
	PreambleStage,
	PreambleStageType,
	PreambleChoice 
} from '@/lib/preamble';

import { Opponent } from '@/lib/opponent'
import { AbilityCard } from '@/lib/ability'
import { BonusCard } from '@/lib/bonus'

type statefnT = (fn: (p: Preamble) => void) => Promise<void>

type renderT = (ps: any) => React.ReactNode

function chooseRenderFn(stage: any): renderT {
	if (stage.field === 'opponent') {
		return (opponent: Opponent): React.ReactNode => 
			OpponentMugshot({ opponent: opponent })
	} 
	if (stage.field === 'ability') {
		return (ability: AbilityCard): React.ReactNode => 
			AbilityTicket({ ability: ability })
	}
	return (bonus: BonusCard): React.ReactNode =>
		BonusTicket({ bonus: bonus })
}

export function ShowPreamble({ preamble, statefn }: {
	preamble: Preamble,
	statefn: statefnT
}) {
	const stage = 
		preamble.stagekey === 'opponent' ? preamble.opponent :
		preamble.stagekey === 'ability' ? preamble.ability :
		preamble.bonus
	const renderFn = chooseRenderFn(stage)

	let options: React.ReactNode[] = []
	for (const [k, v] of stage.options) {
		const art = renderFn(v)
		const tile = OptionTile({
			key: k,
			children: art,
			handler: async () => await statefn((p: Preamble) => PreambleChoice(p, k))
		})
		options.push(tile)
	}
	
	return (
		<main className="flex-1 flex flex-col gap-2 mx-2">
			<h1 className="text-amber-300 text-4xl font-light">
				{stage.title}
			</h1>

			<div className="flex-1 flex flex-col justify-evenly">
				{options}
			</div>
		</main>
	);
}

function OptionTile({ key, children, handler }: {
	key: string
	children: React.ReactNode,
	handler: () => Promise<void>
}) {
	return (
		<button key={key} onClick={handler}>
			{children}
		</button>
	);
}

function OpponentMugshot({ opponent }: {
	opponent: Opponent
}) {
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

function AbilityTicket({ ability }: {
	ability: AbilityCard
}) {
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

function BonusTicket({ bonus }: {
	bonus: BonusCard
}) {
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
