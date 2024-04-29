'use client'

import Link from 'next/link';
import Image from 'next/image';
import { memo, useState, useRef, useEffect, useCallback } from 'react';

import { 
	motion, 
	AnimatePresence,
	useMotionValue,
	useMotionValueEvent,
	useTransform,
	useAnimate,
	animate
} from 'framer-motion';

import { Battler, 
	Battle, 
	Submit, 
	Backspace, 
	BackspaceId, 
	Wipe, 
	Place, 
	PlaceWordbank,
	UseAbility, 
	UpdateScores,
	Checking,
} from '@/lib/battle';
import { Scoresheet } from '@/lib/score'

import { Letter } from '@/lib/letter'
import { DrawLetter } from './letter'

import { Mutator, Clutator } from '@/lib/util'
import { Opponent } from '@/lib/opponent'

import { BonusCard } from '@/lib/bonus'
import { AbilityCard } from '@/lib/ability'

type battlefn = (a: Battle) => Promise<void>
type statefnT = (fn: battlefn) => Promise<void>

export function PlayBattle({ game, endfn }: { 
	game: Battle, 
	endfn: (b: Battle) => Promise<void> 
}) {
	const [myGameX, setMyGameX] = useState(game)
        const clute = useRef(Clutator(myGameX, setMyGameX, endfn))
        const myGame = clute.current.get()
	const mutator = clute.current.set 

	return (
		<main className="flex-1 flex flex-col items-center p-1 gap-1 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-700">
			<DrawOpponent opp={myGame.opponent} />
			<Contest ps={myGame.player.scoresheet} os={myGame.opponent.scoresheet} statefn={mutator} />
			<Player player={myGame.player} statefn={mutator} />
		</main>
	);
}

const DrawProfile = memo(function DrawProfile({ opp, hd }: { opp: Opponent, hd: number }) {
        return (
                <div className="flex flex-row gap-4">
                        <motion.div className="flex-none"
                                initial={{ 
                                        rotate: 0, 
                                        scale: 0
                                }}
                                animate={{ 
                                        rotate: [0, -hd, hd, 0],
                                        scale: [1, 0.9, 1.1, 1]
                                }}
                                transition={{ 
                                        duration: 0.2,
                                        repeat: hd
                                }}
                        >
                                <Image 
                                        src={`/${opp.image}`} 
                                        width={80}
                                        height={80}
                                        alt={`Mugshot of ${opp.name}`}
                                />
                        </motion.div>

                        <div className="flex flex-col">
                                <div className="text-amber-300"><span className="text-lg font-bold">{opp.name}</span> <span className="italic">(Level {opp.level})</span></div>
                                <div className="text-red-300"><span className="font-bold">Uses:</span> {opp.strength.join(', ')}</div>
                                <div className="text-lime-300"><span className="font-bold">Weak to:</span> {opp.weakness.join(', ')}</div>
                        </div>
                </div>
        )
})

const DrawOpponent = memo(function DrawOpponent({ opp }: { opp: Battler }) {
	const hd = opp.profile.healthMax - opp.health 
	return (
		<motion.div className="flex flex-col gap-2">
			<HealthBar badguy={true} health={opp.health} healthMax={opp.profile.healthMax} />

                        <DrawProfile opp={opp.profile} hd={hd} />

			<motion.div initial={{y:-100}} animate={{y:0}} >
				<Placed letters={opp.playArea.placed} />
			</motion.div>
		</motion.div>
	)
})

const HealthBar = memo(function HealthBar({ badguy, health, healthMax }: { 
        badguy: boolean,
        health: number, 
        healthMax: number 
}) {
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
				transition={{ duration: 0.6 }}
				className={color}
			/>
			}
		</div>
	);
})

const ActionButton = memo(function ActionButton({ checking, scoresheet, statefn }: { 
        checking: boolean,
        scoresheet: Scoresheet | undefined,
        statefn: statefnT 
}) {
        return checking ? (
                <motion.button 
                        key="checkbutton"
                        className="p-2 rounded-lg bg-lime-300 text-2xl" 
                        animate={{ scale: 1 }}
                        initial={{ scale: 0 }}
                >
                        Checking...
                </motion.button>
        ) : !scoresheet ? (
                <motion.button 
                        key="checkbutton"
                        className="p-2 rounded-lg bg-lime-300 text-2xl" 
                        onClick={async () => {
                                        await statefn(Checking)
                                        await statefn(UpdateScores)
                                }
                        }
                        animate={{ scale: 1 }}
                        initial={{ scale: 0 }}
                >
                        Check
                </motion.button>
        ) : !scoresheet.ok ? (
                <motion.button 
                        key="checkbutton"
                        className="p-2 rounded-lg bg-red-200 text-2xl" 
                >
                        Invalid
                </motion.button>
        ) : (
                <></>
        )
})

function AttackButton({ statefn }: { statefn: statefnT }) {
        return (
                <motion.button 
                        key="attackbutton"
                        className="p-4 m-4 rounded-lg bg-lime-500 text-2xl" 
                        onClick={async () => await statefn(Submit)}
                        animate={{ scale: 1 }}
                        initial={{ scale: 0 }}
                        exit={{ scale: 0 }}
                >
                        Attack
                </motion.button>
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

function AnimatedNumber({ n }: { n: number }) {
	const [scope, animate] = useAnimate()
	const bigScore = useMotionValue(0)
	const rounded = useTransform(bigScore, (x) => Math.round(x))
	useEffect(() => {
		animate(bigScore, n, { duration: (1/30)*n })
	}, [animate, bigScore, n])

	return (
		<motion.div>{rounded}</motion.div>
	)
}

const ScoreDisplay = memo(function ScoreDisplay({ sheet, color }: { 
        sheet: Scoresheet,
        color: string
}) {
        return (
                <div className={`flex flex-row-reverse justify-between ${color}`}>
                        <div className={`text-6xl ${color}`}>
                                <AnimatedNumber n={sheet.score} />
                        </div>
                        <ScoreTable sheet={sheet} />
                </div>
        )
})

const Contest = memo(function Contest({ ps, os, statefn }: { 
        ps: Scoresheet | undefined,
        os: Scoresheet | undefined,
        statefn: statefnT 
}) {
	return (
		<div className="flex flex-row justify-center gap-2">
			<div className="flex flex-col justify-center text-sm font-light">
                                {os && os.ok && <ScoreDisplay sheet={os} color="text-red-300" />}
                                {ps && ps.ok && <ScoreDisplay sheet={ps} color="text-lime-400" />}
			</div>
                        <AnimatePresence>
			{ps && ps.ok && <AttackButton statefn={statefn} />}
                        </AnimatePresence>
		</div>
	)
})

const Player = memo(function Player({ player, statefn }: { player: Battler, statefn: statefnT }) {
	const [view, setView] = useState('buttons');

	const somebutton = (alias: string, key: string): React.ReactNode => (
		<button 
			className="p-4 text-amber-200 bg-lime-700 rounded-lg"
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
				{player.wordMatches.length > 0 && somebutton('Wordbank', 'wordbank')}
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
		<motion.div className="flex-1 flex flex-col gap-2 px-1"
			transition={{ type: 'spring' }}
		>
		        {player.playArea.placed.length > 0 && <ActionButton checking={player.checking} scoresheet={player.scoresheet} statefn={statefn} />}
			<div className="flex-1">
				<PlayerPlaced letters={player.playArea.placed} statefn={statefn} />
			</div>
			<Hand letters={player.playArea.hand} statefn={statefn} />
			{views[view]()}
			<HealthBar badguy={false} health={player.health} healthMax={player.profile.healthMax} />
		</motion.div>
	)
})

function ListWords({ words, statefn, closefn }: {
	words: string[],
	statefn: statefnT,
	closefn: () => void
}) {
	const placefn = (id: string): ()=>Promise<void> => {
		return async () => {
			await statefn((g: Battle) => PlaceWordbank(g, id))
			await statefn(Checking)
			await statefn(UpdateScores)
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
				<div>Level {bonus.level} (+{bonus.level * bonus.weight} points)</div>
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

const Placed = memo(function Placed({ letters }: { letters: Letter[] }) {
	return (
		<ul className="flex flex-row flex-wrap justify-center gap-1" >
			{letters.map((letter) => 
				<motion.li layoutId={letter.id} key={letter.id} >
					<DrawLetter letter={letter} small={true} />
				</motion.li>
			)}
		</ul>
	);
})

const PlayerPlaced = memo(function PlayerPlaced({ letters, statefn }: { letters: Letter[], statefn: statefnT }) {
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
				{letters.map((letter) => <PlacedLetter key={letter.id} letter={letter} statefn={statefn} />)}
			</ul>

			<button className="bg-red-500 p-1 rounded-lg text-lg font-black"
				onClick={async () => await statefn(Backspace)}
			>
				⌫
			</button>
		</div>
	);
})

const PlacedLetter = memo(function PlacedLetter({ letter, statefn }: {
        letter: Letter,
        statefn: statefnT
}) {
        return (
                <motion.li layoutId={letter.id} key={letter.id} >
                        <button 
                                onClick={async () => await statefn((b: Battle) => BackspaceId(b, letter.id))}
                        >
                                <DrawLetter letter={letter} small={true} />
                        </button>
        </motion.li>
        )
})

const ListLetter = memo(function ListLetter({ letter, statefn }: {
        letter: Letter,
        statefn: statefnT
}) {
	const placefn = useCallback(
                async () => await statefn((g: Battle) => Place(g, letter.id)), 
                [letter, statefn]
        )

        if (letter.available) {
                return (
                        <motion.li layoutId={letter.id} key={letter.id} >
                                <button onClick={placefn}>
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
})

const Hand = memo(function Hand({ letters, statefn }: { letters: Letter[], statefn: statefnT }) {
	return (
		<ul className="flex flex-row gap-1 flex-wrap place-content-center" >
			{letters.map((letter) => <ListLetter key={letter.id} letter={letter} statefn={statefn} />)}
		</ul>
	);
})

