'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Battler, 
	Battle, 
	Submit, 
	Backspace, 
	BackspaceId, 
	Wipe, 
	Place, 
	PlaceWordbank,
	UseAbility, 
	UpdateScores 
} from '@/lib/battle';
import { Scoresheet } from '@/lib/score'

import { Letter } from '@/lib/letter'
import { DrawLetter } from './letter'

import { BonusCard } from '@/lib/bonus'
import { AbilityCard } from '@/lib/ability'

type statefnT = (fn: (a: Battle) => void) => Promise<void>

export function PlayBattle({ game, statefn }: { game: Battle, statefn: statefnT }) {
	return (
		<main className="flex-1 flex flex-col items-center p-1 gap-1 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-700">
			<DrawOpponent opp={game.opponent} />
			<Contest game={game} statefn={statefn} />
			<Player player={game.player} statefn={statefn} />
		</main>
	);
}

function DrawOpponent({ opp }: { opp: Battler }) {
	return (
		<motion.div className="flex flex-col gap-2">
			<HealthBar badguy={true} health={opp.health} healthMax={opp.healthMax} />

			<div className="flex flex-row gap-4">
				<div className="flex-none">
					<Image 
						src={`/${opp.image}`} 
						width={120}
						height={120}
						alt={`Mugshot of ${opp.name}`}
					/>
				</div>

				<div className="flex flex-col">
					<div className="text-amber-300"><span className="text-lg font-bold">{opp.name}</span> <span className="italic">({opp.desc})</span></div>
					<div className="text-red-300"><span className="font-bold">Uses:</span> {opp.strength.join(', ')}</div>
					<div className="text-lime-300"><span className="font-bold">Weak to:</span> {opp.weakness.join(', ')}</div>
				</div>
			</div>

			<motion.div initial={{y:-100}} animate={{y:0}} >
				<Placed letters={opp.placed} />
			</motion.div>
		</motion.div>
	)
}

function HealthBar({ badguy, health, healthMax }: { badguy: boolean, health: number, healthMax: number }) {
	const color = badguy ? "bg-red-800" : "bg-lime-500";
	const healthpct = Math.floor((health/healthMax) * 100.0)

	return (
		<div
			className={[
				"w-full h-4",
				"border-2 border-black",
				"bg-zinc-400",
				"flex"
			].join(' ')}
		>
			{healthpct > 0 &&
			<motion.div 
				initial={{width:"0%"}} 
				animate={{width:`${healthpct}%`}} 
				className={color}
			/>
			}
		</div>
	);
}

function ActionButton({ player, statefn }: { player: Battler, statefn: statefnT }) {
	return (
		<AnimatePresence>
			{ player.placed.length === 0 ? (
				<></>
			) : player.checkScore ? (
				<motion.button 
					key="checkbutton"
					className="p-2 rounded-lg bg-lime-300 text-2xl" 
					animate={{ scale: 1 }}
					initial={{ scale: 0 }}
					exit={{ scale: 0 }}
				>
					Checking...
				</motion.button>
			) : !player.scoresheet.checked ? (
				<motion.button 
					key="checkbutton"
					className="p-2 rounded-lg bg-lime-300 text-2xl" 
					onClick={async () => await statefn(UpdateScores)}
					animate={{ scale: 1 }}
					initial={{ scale: 0 }}
					exit={{ scale: 0 }}
				>
					Check
				</motion.button>
			) : !player.scoresheet.ok ? (
				<motion.button 
					key="checkbutton"
					className="p-2 rounded-lg bg-red-200 text-2xl" 
				>
					Invalid
				</motion.button>
			) : (
				<motion.button 
					key="attackbutton"
					className="p-4 m-4 rounded-lg bg-lime-500 text-2xl" 
					onClick={async () => await statefn(Submit)}
					animate={{ x: 0 }}
					initial={{ x: 200 }}
					exit={{ y: -100 }}
				>
					Attack
				</motion.button>
			) }
		</AnimatePresence>
	)
}

function ScoreTable({ sheet }: { sheet: Scoresheet}) {
	return (
		<table className="text-right">
			<tbody>
				{sheet.adds.map((sm) => (
				<tr key={sm.source}>
					<th className="font-medium" scope="row">{sm.source}</th>
					<td>+{sm.value}</td>
				</tr>))}
				{sheet.muls.map((sm) => (
				<tr key={sm.source}>
					<th className="font-medium" scope="row">{sm.source}</th>
					<td>x{sm.value}</td>
				</tr>))}
			</tbody>
		</table>
	)
}


function Contest({ game, statefn }: { game: Battle, statefn: statefnT }) {
	const playerZone = game.player.scoresheet.ok ? (
		<div className="flex flex-row-reverse justify-between text-lime-500">
			<div className="text-6xl text-lime-400">
				{game.player.scoresheet.score}
			</div>
			<ScoreTable sheet={game.player.scoresheet} />
		</div>
	) : (
		<ActionButton player={game.player} statefn={statefn} />
	)
	return (
		<div className="flex flex-row gap-2">
			<div className="flex flex-col justify-center text-sm font-light">
				<div className="flex flex-row-reverse justify-between text-red-300">
					<div className="self-end text-6xl text-red-300">
						{game.opponent.scoresheet.score}
					</div>
					<ScoreTable sheet={game.opponent.scoresheet} />
				</div>

				{playerZone}
			</div>
			{game.player.scoresheet.ok &&
				<ActionButton player={game.player} statefn={statefn} />
			}
		</div>
	)
}

function Player({ player, statefn }: { player: Battler, statefn: statefnT }) {
	const [view, setView] = useState('buttons');

	const somebutton = (alias: string, key: string): React.ReactNode => (
		<button 
			className="p-6 bg-lime-600 rounded-3xl"
			onClick={() => setView(key)}
		>
			{alias}
		</button>
	)

	const views: Record<string, () => React.ReactNode> = {
		buttons: (): React.ReactNode => (
			<div className="flex flex-row gap-4 justify-center">
				{somebutton('Bonuses', 'bonuses')}
				{somebutton('Abilities', 'abilities')}
				{somebutton('Wordbank', 'wordbank')}
			</div>
		),

		abilities: (): React.ReactNode => (
			<AbilityCarousel player={player} statefn={statefn} closefn={() => setView('buttons')}/>
		),

		bonuses: (): React.ReactNode => (
			<BonusCarousel player={player} closefn={() => setView('buttons')}/>
		),

		wordbank: (): React.ReactNode => (
			<ListWords words={player.wordMatches} statefn={statefn} closefn={() => setView('buttons')}/>
		)
	}

	return (
		<motion.div className="flex-1 flex flex-col gap-4"
			layout 
			transition={{ type: 'spring' }}
		>
			<div className="flex-1">
				<PlayerPlaced letters={player.placed} statefn={statefn} />
			</div>
			<Hand letters={player.hand} statefn={statefn} />
			{views[view]()}
			<HealthBar badguy={false} health={player.health} healthMax={player.healthMax} />
		</motion.div>
	)
}

function ListWords({ words, statefn, closefn }: {
	words: string[],
	statefn: statefnT,
	closefn: () => void
}) {
	const placefn = (id: string): ()=>Promise<void> => {
		return async () => {
			return await statefn((g: Battle) => {
				PlaceWordbank(g, id)
				UpdateScores(g)
			})
		}
	}

	return (
		<div className="flex flex-row justify-stretch gap-2">
			<button 
				className="bg-red-500 p-2 rounded-lg" 
				onClick={closefn}
			>
				Back
			</button>

			<ul className="flex-1 bg-orange-200 p-2 flex flex-row font-bold text-lg gap-2 flex-wrap">
				{words.map((word, letters) => (
					<li key={word}>
						<button
							onClick={placefn(word)}
						>{word}</button>
					</li>
				))}
			</ul>
		</div>
	)
}

function BonusCarousel({ player, closefn }: { 
	player: Battler,
	closefn: () => void
}) {
	const [idx, setIdx] = useState(0);
	if (player.bonuses.size === 0) {
		return (<></>)
	}

	let keys: string[] = []
	for (const [k, v] of player.bonuses) {
		keys.push(k)
	}
	const bonus = player.bonuses.get(keys[idx]) as BonusCard
	return (
		<div className="grid grid-cols-5 grid-rows-5 gap-2 place-content-center">
			<div className="row-start-1 row-span-4 col-start-1 col-span-5 flex flex-col bg-orange-200 p-2">
				<h1 className="text-2xl">
					{bonus.name}
				</h1>
				<p className="">
					{bonus.desc}
				</p>
				<div>Level {bonus.level} (+{bonus.level*2} points)</div>
			</div>

			<button 
				className="bg-red-500 row-start-5 col-start-1 col-span-2 w-20" 
				onClick={closefn}
			>
				Back
			</button>

			{idx > 0 &&
			<button className="bg-amber-300 row-start-5 col-start-3 col-span-1"
				onClick={() => setIdx(idx-1)}
			>Prev</button>}

			{(idx+1 !== keys.length) && 
			<button className="bg-amber-300 row-start-5 col-start-4 col-span-1"
				onClick={() => setIdx(idx+1)}
			>Next</button>
			}
		</div>
	);
}

function AbilityCarousel({ player, statefn, closefn }: {
	player: Battler,
	statefn: statefnT,
	closefn: () => void
}) {
	const [idx, setIdx] = useState(0);
	if (player.abilities.size === 0) {
		return (<></>)
	}

	let keys: string[] = []
	for (const [k, v] of player.abilities) {
		keys.push(k)
	}
	const ability = player.abilities.get(keys[idx]) as AbilityCard
	const canuse = ability.ok && ability.uses > 0;
	const use = async () => await statefn((g: Battle) => UseAbility(g, keys[idx]))
	return (
		<div className="grid grid-cols-5 grid-rows-5 gap-2 place-content-center">
			<div className="row-start-1 row-span-4 col-start-1 col-span-4 flex flex-col bg-orange-200 p-2">
				<h1 className="text-2xl">
					{ability.name}
				</h1>
				<p className="">
					{ability.desc}
				</p>
				<div className="">
					{ability.uses} uses remaining
				</div>
			</div>

			{canuse ? 
				<button className="row-start-1 row-span-4 col-start-5 col-span-1 bg-lime-500 w-20"
					onClick={use}
				>
					Use
				</button>
			: 
				<button className="row-start-1 row-span-4 col-start-5 col-span-1 bg-neutral-500 w-20">
					Use
				</button>
			}

			<button 
				className="bg-red-500 row-start-5 col-start-1 col-span-2 w-20" 
				onClick={closefn}
			>
				Back
			</button>

			{idx > 0 &&
			<button className="bg-amber-300 row-start-5 col-start-3 col-span-1"
				onClick={() => setIdx(idx-1)}
			>Prev</button>}

			{(idx+1 !== keys.length) && 
			<button className="bg-amber-300 row-start-5 col-start-4 col-span-1"
				onClick={() => setIdx(idx+1)}
			>Next</button>
			}
		</div>
	);
}

function Placed({ letters }: { letters: Letter[] }) {
	return (
		<ul className="flex flex-row flex-wrap justify-center gap-1" >
			{letters.map((letter) => 
				<motion.li layoutId={letter.id} key={letter.id} >
					<DrawLetter letter={letter} small={true} />
				</motion.li>
			)}
		</ul>
	);
}

function PlayerPlaced({ letters, statefn }: { letters: Letter[], statefn: statefnT }) {
	if (letters.length === 0) {
		return (<></>)
	}

	return (
		<div className="self-stretch flex flex-row justify-between gap-4">
			<button className="bg-red-500 p-1 rounded-lg align-top text-lg"
				onClick={async () => await statefn(Wipe)}
			>
				Clear
			</button>

			<ul className="flex flex-row flex-wrap gap-1" >
				{letters.map((letter) => 
					<motion.li layoutId={letter.id} key={letter.id} >
						<button 
							onClick={async () => await statefn((b: Battle) => BackspaceId(b, letter.id))}
						>
						<DrawLetter letter={letter} small={true} />
						</button>
					</motion.li>
				)}
			</ul>

			<button className="bg-red-500 p-1 rounded-lg text-lg font-black"
				onClick={async () => await statefn(Backspace)}
			>
				⌫
			</button>
		</div>
	);
}

function Hand({ letters, statefn }: { letters: Letter[], statefn: statefnT }) {
	const placefn = (id: string): ()=>Promise<void> => {
		return async () => {
			return await statefn((g: Battle) => Place(g, id))
		}
	}
	return (
		<ul className="flex flex-row gap-1 flex-wrap place-content-center" >
			{letters.map((letter) => { 
				if (letter.available) {
					return (
						<motion.li layoutId={letter.id} key={letter.id} >
							<button onClick={placefn(letter.id)}>
								<DrawLetter letter={letter} small={false} />
							</button>
						</motion.li>
					)
				} else {
					const nid = `ghost-of-${letter.id}`;
					return (
						<motion.li 
							initial={{opacity: 1.0}} 
							animate={{opacity: 0.1}} 
							exit={{opacity: 1.0}} 
							layoutId={nid} 
							key={nid} 
						>
							<DrawLetter letter={letter} small={false} />
						</motion.li>
					)
				}
			})}
		</ul>
	);
}

