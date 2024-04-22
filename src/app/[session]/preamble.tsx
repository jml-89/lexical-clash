'use client'

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion'

import { 
	Preamble, 
	PreambleStage,
	PreambleStageType,

	ChooseOpponent,
	ChooseAbility,
	ChooseBonus,
	ChooseWord
} from '@/lib/preamble';

import { Opponent } from '@/lib/opponent'
import { AbilityCard } from '@/lib/ability'
import { BonusCard } from '@/lib/bonus'

import { Mutator, ScoredWord, HyperSet } from '@/lib/util'

type preamblefn = (p: Preamble) => Promise<void>
type statefnT = (fn: preamblefn) => Promise<void>

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
	if (stage.field === 'bonus') {
		return (bonus: BonusCard): React.ReactNode =>
			BonusTicket({ bonus: bonus })
	}
	return (hs: HyperSet): React.ReactNode =>
		ShowWordBooster({ hs: hs })
}

function ShowStageOptions({ preamble, statefn }: {
	preamble: Preamble,
	statefn: statefnT
}): React.ReactNode {
	if (preamble.stagekey === 'opponent') {
		const opts = [ ...preamble.opponent.options.values() ]
		return opts.map((o) => 
			OptionTile({
				key: o.key,
				children: OpponentMugshot({ opponent: o }),
				handler: () => statefn(async (p: Preamble) =>
					ChooseOpponent(p, o)
				)
			})
		)
	}

	if (preamble.stagekey === 'ability') {
		const opts = [ ...preamble.ability.options.values() ]
		return opts.map((o) =>
			OptionTile({
				key: o.key,
				children: AbilityTicket({ ability: o }),
				handler: () => statefn(async (p: Preamble) =>
					ChooseAbility(p, o)
				)
			})
		)
	}

	if (preamble.stagekey === 'bonus') {
		const opts = [ ...preamble.bonus.options.values() ]
		return opts.map((o) =>
			OptionTile({
				key: o.key,
				children: BonusTicket({ bonus: o }),
				handler: () => statefn(async (p: Preamble) =>
					ChooseBonus(p, o)
				)
			})
		)
	}

	if (preamble.stagekey === 'word') {
		const opts = [ ...preamble.word.options.values() ]
		return opts.map((o) =>
			OptionTile({
				key: o.hypernym,
				children: ShowWordBooster({ hs: o }),
				handler: () => statefn(async (p: Preamble) =>
					ChooseWord(p, o)
				)
			})
		)
	}

	return (<></>)
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

	const title = myPreamble.stagekey === 'opponent' ? 'Select Your Opponent'
		: myPreamble.stagekey === 'ability' ? 'Select An Ability'
		: myPreamble.stagekey === 'bonus' ? 'Select A Bonus'
		: myPreamble.stagekey === 'word' ? 'Select A Word Booster'
		: 'Un-Titled'

	return (
		<main className="flex-1 flex flex-col gap-2 mx-2 items-center">
			<div className="text-amber-500 text-lg">
				<div>Level {myPreamble.level}</div>
			</div>

			<div className="grid">
			<AnimatePresence>
				<motion.div key={title}
					initial={{ x: 1200 }}
					animate={{ x: 0 }}
					exit={{ x: -1200 }}
					transition={{ duration: 0.6 }}
					className="row-start-1 col-start-1 flex flex-col gap-2 items-center"
				>
					<div className="text-amber-300 text-4xl font-light">
						{title}
					</div>

					<div className="flex-1 flex flex-col gap-2 justify-start">
						<ShowStageOptions preamble={myPreamble} statefn={statefn} />
					</div>
				</motion.div>
			</AnimatePresence>
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
		<motion.button key={key} onClick={handler}
			className={[
				"rounded-lg shadow-2xl",
				"bg-slate-700",
				"p-2 gap-2", "text-amber-300"
			].join(' ')}

			whileHover={{ scale: 1.1 }}
			whileTap={{ scale: 1.5 }}
		>
			{children}
		</motion.button>
	);
}

function OpponentMugshot({ opponent }: {
	opponent: Opponent
}) {
	return (
		<div key={opponent.name} className="flex flex-row gap-1" >
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
	const comment = ability.uses > 1 ?
		`Upgrade to ${ability.uses} uses` :
		`New`
	return (
		<div key={ability.name} className="flex flex-col gap-1">
			<h1 className="text-xl font-bold">{ability.name}</h1>
			<div className="italic">{ability.desc}</div>
			<div>{comment}</div>
		</div>
	);
}

function BonusTicket({ bonus }: {
	bonus: BonusCard
}) {
	return (
		<div key={bonus.name} className="flex flex-col gap-1">
			<h1 className="text-xl font-bold">{bonus.name}</h1>
			<div className="italic">{bonus.desc}</div>
			<div><span className="font-bold">Level {bonus.level}:</span> {bonus.weight * bonus.level} points</div>
		</div>
	);
}

function ShowWordBooster({ hs }: {
	hs: HyperSet
}) {
	const stride = 3
	const midx = Math.floor((hs.hyponyms.length - stride) / 2)

	const fli = (s: ScoredWord): React.ReactNode => (<li key={s.word}>{s.word}</li>)
	const lo = hs.hyponyms.slice(0, stride)
	const md = hs.hyponyms.slice(midx, midx+stride)
	const hi = hs.hyponyms.slice(hs.hyponyms.length - stride)

	return (
		<div key={hs.hypernym} className="flex flex-col gap-1 justify-start">
			<div className="flex flex-row justify-between">
				<h1 className="text-xl font-bold">{hs.hypernym}</h1>
				<div>({hs.definitions.length} definitions, {hs.hyponyms.length} words)</div>
			</div>

			<div className="self-baseline italic">{hs.definitions[0]}</div>

			<ul className="flex flex-row flex-wrap place-content-around gap-1">
				{lo.map(fli)}
				<li key="low-key">...</li>
				{md.map(fli)}
				<li key="mid-key">...</li>
				{hi.map(fli)}
			</ul>
		</div>
	);
}

