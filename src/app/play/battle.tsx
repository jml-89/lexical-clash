'use client'

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Submit, Backspace, Place, UseAbility, UpdateScores } from '@/lib/battle.ts';


export function Battle({ game, statefn }) {
	return (
		<main className="h-svh w-svw grid grid-rows-12 grid-cols-1">
			<div className="row-span-2 p-1">
				<Opponent game={game} />
			</div>

			<div className="row-span-2">
				<Contest game={game} statefn={statefn} />
			</div>

			<div className="row-span-8 p-2">
				<Player game={game} statefn={statefn} />
			</div>
		</main>
	);
}

function Opponent({ game }) {
	return (
		<motion.div 
			name="opponent-area" 
			className={
				[ "grid grid-rows-2"
				, "gap-2"
				].join(' ')
			}
		>
			<div className="row-start-1 flex flex-row gap-6">
				<h2 className="place-self-start text-2xl font-medium tracking-tighter">{game.opponent.name}</h2>

				<HealthBar badguy={true} health={game.oppHealth} healthMax={game.opponent.healthMax} />
			</div>

			<motion.div initial={{y:-100}} animate={{y:0}} className="row-start-2">
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
			<button 
				className="p-6 rounded-lg bg-neutral-200 text-2xl" 
			>
				<div>Check</div>
			</button>
		)
	}

	if (!game.scoresheet.player.checked) { 
		return (
			<button 
				className="p-6 rounded-lg bg-lime-300 text-2xl" 
				onClick={async () => await statefn(UpdateScores)}
			>
				<div>Check</div>
			</button>
		)
	}

	if (!game.scoresheet.player.ok) {
		return (
			<button 
				className="p-6 rounded-lg bg-lime-200 text-2xl" 
			>
				<div>Invalid</div>
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

function Contest({ game, statefn }) {

	return (
		<div className="h-full bg-amber-600 grid grid-cols-3 place-content-center place-items-center">
			<div className="text-2xl" />
			<div className="h-full flex place-content-center place-items-center">
				<div className="place-self-start text-6xl font-bold text-red-900">
					{game.scoresheet.opponent.score}
				</div>

				<div className="place-self-end text-6xl font-bold text-lime-800">
					{game.scoresheet.player.score}
				</div>
			</div>

			<ActionButton game={game} statefn={statefn} />
		</div>
	);
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
		<div className="size-full grid grid-rows-8 gap-4">
			<div className="row-span-4">
			<motion.div 
				layout 
				transition={{ type: 'spring' }}
				className={[""
					,"flex flex-col gap-4"
					,"place-content-center place-items-center"
					,"m-0"].join(' ')}
			>
				<div className="h-14">
					<PlayerPlaced letters={game.placed} statefn={statefn} />
				</div>
				<div>
					<Hand letters={game.hand} statefn={statefn} />
				</div>
			</motion.div>
			</div>
			
			<div className="row-span-3">
				{views[view]()}
			</div>

			<div className="row-span-1">
				<HealthBar badguy={false} health={game.health} healthMax={game.healthMax} />
			</div>
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
					<Letter letter={letter} />
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
						<Letter letter={letter} />
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

function Letter({ letter }) {
	return (
		<div className={["w-12 h-12 border-solid border-4 border-stone-600"
				,"bg-stone-400",
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

function keyFaker(handler, key) {
	return async () => await handler({ key: key });
}

