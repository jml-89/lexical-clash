'use client'

import { useState, useCallback } from 'react';
import Image from 'next/image';

import { 
	Preamble, 
	WordBooster,
	OpponentPreamble,
	PreambleStage,
	PreambleStageType,
	PreambleChoice 
} from '@/lib/preamble';

import { AbilityCard } from '@/lib/ability'
import { BonusCard } from '@/lib/bonus'

import { Mutator } from '@/lib/util'

type preamblefn = (p: Preamble) => Promise<void>
type statefnT = (fn: preamblefn) => Promise<void>

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
	if (stage.field === 'bonus') {
		return (bonus: BonusCard): React.ReactNode =>
			BonusTicket({ bonus: bonus })
	}
	return (word: WordBooster): React.ReactNode =>
		ShowWordBooster({ word: word })
}

export function ShowPreamble({ preamble, endfn }: {
	preamble: Preamble,
	endfn: (p: Preamble) => Promise<void>
}) {
	const [myPreamble, setMyPreamble] = useState(preamble)
	const statefn = useCallback(
		async function(fn: preamblefn): Promise<void> {
			await Mutator(myPreamble, fn, setMyPreamble, endfn)
	}, [myPreamble, setMyPreamble, endfn])

	const stage = 
		myPreamble.stagekey === 'opponent' ? myPreamble.opponent :
		myPreamble.stagekey === 'ability' ? myPreamble.ability :
		myPreamble.stagekey === 'bonus' ? myPreamble.bonus :
		myPreamble.word

	const renderFn = chooseRenderFn(stage)

	let options: React.ReactNode[] = []
	for (const [k, v] of stage.options) {
		const art = renderFn(v)
		const tile = OptionTile({
			key: k,
			children: art,
			handler: async () => await statefn(async (p: Preamble) => await PreambleChoice(p, k))
		})
		options.push(tile)
	}
	
	return (
		<main className="flex-1 flex flex-col gap-2 mx-2 items-center">
			<h1 className="text-amber-300 text-4xl font-light">
				{stage.title}
			</h1>

			<div className="flex flex- items-center gap-2 text-amber-500 text-lg">
				<div>Level {myPreamble.level}</div>
			</div>

			<div className="flex-1 flex flex-col gap-2 justify-start">
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
				<h1 className="text-amber-300 text-xl">{opponent.name}</h1>
				<div className="text-amber-300 italic">Level {opponent.level} {opponent.desc}</div>
			
				<div className="text-red-300"><span className="font-bold">Uses:</span> {opponent.strength.join(', ')}</div>
				<div className="text-lime-300"><span className="font-bold">Weak to:</span> {opponent.weakness.join(', ')}</div>
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

function ShowWordBooster({ word }: {
	word: WordBooster
}) {
	const stride = 4
	const midx = Math.floor((word.samples.length - stride) / 2)

	const fli = (s: string): React.ReactNode => (<li key={s}>{s}</li>)
	const lo = word.samples.slice(0, stride)
	const md = word.samples.slice(midx, midx+stride)
	const hi = word.samples.slice(word.samples.length - stride)

	return (
		<div key={word.word} 
			className={[
				"flex flex-col",
				"rounded-xl",
				"bg-slate-700",
				"text-amber-300",
				"p-2 gap-2"
			].join(' ')}
		>
			<div className="flex flex-col gap-2 justify-start">
				<div className="flex flex-row justify-between">
					<h1 className="text-xl font-bold">{word.word}</h1>
					<div>{word.len} words</div>
				</div>

				<ul className="flex flex-row flex-wrap place-content-around gap-1">
					{lo.map(fli)}
					<li key="low-key">...</li>
					{md.map(fli)}
					<li key="mid-key">...</li>
					{hi.map(fli)}
				</ul>
			</div>
		</div>
	);
}

