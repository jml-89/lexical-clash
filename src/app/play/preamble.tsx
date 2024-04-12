'use client'

import { useState } from 'react';
import Image from 'next/image';

import { 
	Preamble, 
	OpponentPreamble,
	PreambleStage,
	PreambleStageType,
	PreambleChoice 
} from '@/lib/preamble';

import { AbilityCard } from '@/lib/ability'
import { BonusCard } from '@/lib/bonus'

type statefnT = (fn: (p: Preamble) => void) => Promise<void>

type renderT = (ps: any) => React.ReactNode

function chooseRenderFn(stage: any): renderT {
	if (stage.field === 'opponent') {
		return (opponent: OpponentPreamble): React.ReactNode => 
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
		<main className="flex-1 flex flex-col gap-2 mx-2 items-center">
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
	opponent: OpponentPreamble
}) {
	const [note, noteColor] 
		= opponent.relativeLevel < 0 ? 
			["Easy", "text-lime-300" ] 
		: opponent.relativeLevel === 0 ? 
			[ "Medium", "text-amber-300" ]
		: opponent.relativeLevel === 1 ? 
			[ "Challenging", "text-orange-300" ]
		: 
			[ "Very Dangerous", "text-red-300" ]

	return (
		<div key={opponent.name} 
			className={[
				"flex flex-row",
				"rounded-xl",
				"bg-slate-700",
				"p-2 gap-2"
			].join(' ')}
		>
			<div className="flex-none">
			<Image 
				src={`/${opponent.image}`} 
				width={120}
				height={120}
				alt={`Mugshot of ${opponent.name}`}
			/>
			</div>

			<div className="flex flex-col justify-between items-baseline text-left">
				<h1 className="text-amber-300 text-xl">{opponent.name} <span className="italic">({opponent.desc})</span></h1>
			
				<div className="text-red-300"><span className="font-bold">Uses:</span> {opponent.strength.join(', ')}</div>
				<div className="text-lime-300"><span className="font-bold">Weak to:</span> {opponent.weakness.join(', ')}</div>

				<div className="text-xl text-yellow-500">
					Difficulty: <span className={`text-2xl font-light ${noteColor}`}>{note}</span>
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
