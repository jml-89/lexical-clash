'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Submit, Backspace, Place, UseAbility, UpdateScores } from '@/lib/battle.ts';


export function Battle({ game, statefn }) {
	return (
		<main className="flex-1 flex flex-col justify-between p-1 gap-1 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-700">
			<Opponent game={game} />
			<Contest game={game} statefn={statefn} />
			<Player game={game} statefn={statefn} />
		</main>
	);
}

function Opponent({ game }) {
	return (
		<motion.div 
			name="opponent-area" 
			className={
				[ "flex flex-col"
				, "gap-2"
				].join(' ')
			}
		>
			<HealthBar badguy={true} health={game.oppHealth} healthMax={game.opponent.healthMax} />

			<div className="flex flex-row gap-4">
				<div className="">
					<Image 
						src={`/${game.opponent.image}`} 
						width={120}
						height={120}
						alt={`Mugshot of ${game.opponent.name}`}
					/>
				</div>

				<div className="flex flex-col">
					<div className="text-amber-300"><span className="text-lg font-bold">{game.opponent.name}</span> (<span className="italic">{game.opponent.desc}</span>)</div>
					<div className="text-lime-300"><span className="font-bold">Weak to:</span> {game.opponent.weaknesses.join(', ')}</div>
					<div className="text-red-300"><span className="font-bold">Strong against:</span> {game.opponent.strengths.join(', ')}</div>
				</div>
			</div>

			<motion.div initial={{y:-100}} animate={{y:0}} className="row-start-2 place-self-start">
				<Placed letters={game.oppPlaced} />
			</motion.div>
		</motion.div>
	)
}

function HealthBar({ badguy, health, healthMax }) {
	const color = badguy ? "bg-red-800" : "bg-lime-500";
	function pip(idx, color) {
		const k = `pip-${idx}`;
		const cn = ["flex-1", color].join(' ');
		return (<div key={k} className={cn} />);
	}

	const pips = []
	for (let i = 0; i < health; i++) {
		pips.push(pip(i, color));
	}

	for (let i = health; i < healthMax; i++) {
		pips.push(pip(i, 'bg-zinc-400'));
	}

	return (
		<div
			className={[
				"w-full h-4",
				"border-2 border-black",
				"bg-zinc-400",
				"flex"
			].join(' ')}
		>
			{pips}
		</div>
	);
}

function ActionButton({ game, statefn }) {
	if (game.placed.length === 0) {
		return (
			<></>
		)
	}

	if (!game.scoresheet.player.checked) { 
		return (
			<button 
				className="p-2 rounded-lg bg-lime-300 text-2xl" 
				onClick={async () => await statefn(UpdateScores)}
			>
				<div>Check Word</div>
			</button>
		)
	}

	if (!game.scoresheet.player.ok) {
		return (
			<button 
				className="p-2 rounded-lg bg-red-200 text-2xl" 
			>
				<div>Invalid Word</div>
			</button>
		)
	}

	return (
		<button 
			className="p-6 rounded-lg bg-lime-500 text-2xl" 
			onClick={async () => await statefn(Submit)}
		>
			<div>Attack</div>
		</button>
	) 
}

function ScoreTable({ scoreline }) {
	return (
		<table className="text-right">
			<tbody>
				{scoreline.adds.map((sm) => (
				<tr key={sm.source}>
					<th className="font-medium" scope="row">{sm.source}</th>
					<td>+{sm.value}</td>
				</tr>))}
				{scoreline.muls.map((sm) => (
				<tr key={sm.source}>
					<th className="font-medium" scope="row">{sm.source}</th>
					<td>x{sm.value}</td>
				</tr>))}
			</tbody>
		</table>
	)
}

function Contest({ game, statefn }) {
	if (game.scoresheet.player.ok) {
		return (
			<div className="flex flex-row-reverse gap-2">
				<ActionButton game={game} statefn={statefn} />
				<div className="flex flex-col justify-center text-sm font-light">
					<div className="flex flex-row-reverse justify-between text-red-300">
						<div className="self-end text-6xl text-red-300">
							{game.scoresheet.opponent.score}
						</div>
						<ScoreTable scoreline={game.scoresheet.opponent} />
					</div>

					<div className="flex flex-row-reverse justify-between text-lime-500">
						<div className="text-6xl text-lime-400">
							{game.scoresheet.player.score}
						</div>
						<ScoreTable scoreline={game.scoresheet.player} />
					</div>
				</div>
			</div>
		);
	} else {
		return (
			<ActionButton game={game} statefn={statefn} />
		);
	}
}

function Player({ game, statefn }) {
	const [view, setView] = useState('buttons');

	const somebutton = (alias, key) => (
		<button 
			className="p-6 bg-lime-600 rounded-3xl"
			onClick={() => setView(key)}
		>
			{alias}
		</button>
	)

	const views = {
		buttons: () => (
			<div className="grid grid-cols-2 place-items-center">
				{somebutton('Bonuses', 'bonuses')}
				{somebutton('Abilities', 'abilities')}
			</div>
		),

		abilities: () => (
			<AbilityCarousel game={game} statefn={statefn} closefn={() => setView('buttons')}/>
		),

		bonuses: () => (
			<BonusCarousel game={game} closefn={() => setView('buttons')}/>
		)
	}

	return (
		<div className="size-full flex flex-col-reverse gap-4">
			<HealthBar badguy={false} health={game.health} healthMax={game.healthMax} />
			{views[view]()}
			<motion.div 
				layout 
				transition={{ type: 'spring' }}
				className={[""
					,"flex flex-col gap-4"
					,"place-content-center place-items-center"
					,"m-0"].join(' ')}
			>
				<div className="place-self-start h-14">
					<PlayerPlaced letters={game.placed} statefn={statefn} />
				</div>
				<div>
					<Hand letters={game.hand} statefn={statefn} />
				</div>
			</motion.div>
		</div>
	)
}

function BonusCarousel({ game, closefn }) {
	if (game.bonuses.size === 0) {
		return (<></>)
	}

	let keys: string[] = []
	for (const [k, v] of game.bonuses) {
		keys.push(k)
	}
	const [idx, setIdx] = useState(0);
	const bonus = game.bonuses.get(keys[idx])
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

function AbilityCarousel({ game, statefn, closefn }) {
	if (game.abilities.size === 0) {
		return (<></>)
	}

	let keys: string[] = []
	for (const [k, v] of game.abilities) {
		keys.push(k)
	}
	const [idx, setIdx] = useState(0);
	const ability = game.abilities.get(keys[idx]);
	const canuse = ability.ok && ability.uses > 0;
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
					onClick={async () => await statefn((g, s) => UseAbility(g, s, keys[idx]))}
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

function Placed({ letters }) {
	return (
		<ul className="flex flex-row gap-1" >
			{letters.map((letter) => 
				<motion.li layoutId={letter.id} key={letter.id} >
					<LetterSmall letter={letter} />
				</motion.li>
			)}
		</ul>
	);
}


function PlayerPlaced({ letters, statefn }) {
	return (
		<button onClick={async () => await statefn(Backspace)}>
			<ul className="flex flex-row gap-1" >
				{letters.map((letter) => 
					<motion.li layoutId={letter.id} key={letter.id} >
						<LetterSmall letter={letter} />
					</motion.li>
				)}
				{letters.length > 0 && 
					<div className="bg-red-500 my-1 px-2 rounded-2xl align-top text-4xl font-black">
						⌫
					</div>
				}
			</ul>
		</button>
	);
}

function Hand({ letters, statefn }) {
	const placefn = (id) => {
		return async () => {
			return await statefn((g, s) => Place(g, s, id))
		}
	}
	return (
		<ul className="flex flex-row gap-1 flex-wrap place-content-start" >
			{letters.map((letter) => { 
				if (letter.available) {
					return (
						<motion.li layoutId={letter.id} key={letter.id} >
							<button onClick={placefn(letter.id)}>
								<Letter letter={letter} />
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
							<Letter letter={letter} />
						</motion.li>
					)
				}
			})}
		</ul>
	);
}

function LetterSmall({ letter }) {
	const [bg, bo] = letter.upgrades === 0 ? 
		['bg-stone-400', 'border-stone-600'] :
		['bg-orange-400', 'border-orange-600'] 
	return (
		<div className={["w-8 h-8 border-solid border-2"
				, bg, bo, "p-0.5",
				,"shadow-sm shadow-zinc-400"
				,"grid grid-cols-3 grid-rows-3"].join(' ')}
		>
			<div className={
				["row-start-1 col-start-1 row-span-3 col-span-2"
				,"text-xl font-bold"
				].join(' ')}
			>
				{letter.char}
			</div>
			<div className={["row-start-3 col-start-3 self-end"
					,"text-xs font-light"
					].join(' ')}
			>
				{letter.score}
			</div>
		</div>
	);
}

function Letter({ letter }) {
	const [bg, bo] = letter.upgrades === 0 ? 
		['bg-stone-400', 'border-stone-600'] :
		['bg-orange-400', 'border-orange-600'] 
	return (
		<div className={["w-12 h-12 border-solid border-4"
				, bg, bo
				,"shadow-sm shadow-zinc-400"
				,"grid grid-cols-3 grid-rows-3"].join(' ')}
		>
			<div className={
				["row-start-1 col-start-1 row-span-3 col-span-2"
				,"text-3xl font-bold"
				].join(' ')}
			>
				{letter.char}
			</div>
			<div className={["row-start-3 col-start-3 self-end"
					,"text-xs font-light"
					].join(' ')}
			>
				{letter.score}
			</div>
		</div>
	);
}

