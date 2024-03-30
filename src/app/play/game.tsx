'use client'

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { NewGame, NextPreamble, EndPreamble, WithCopy } from '@/lib/game.ts';

import { Battle } from './battle.tsx';
import { Preamble } from './preamble.tsx';
import { Outcome } from './outcome.tsx';

export function Game({ wordchecker }) {
	const [game, setGame] = useState(NewGame());
	const statefn = useCallback(async (fn) => {
		setGame(await WithCopy(game, wordchecker, fn));
	})

	/*
	const keyed = useCallback( async (e: Event) => {
		const ng = await Mutate(game, e.key);
		setGame(ng);
	}, [game]);

	useEffect( () => {
		document.addEventListener('keyup', keyed);
		return () => {
			document.removeEventListener('keyup', keyed);
		}
	}, [keyed, setGame, game]);
	*/

	if (game.phase.type === 'preamble') {
		return (<Preamble phase={game.phase} statefn={statefn} />);
	}

	if (game.phase.type === 'battle') {
		return (<Battle game={game.phase} statefn={statefn} />);
	}

	if (game.phase.type === 'outcome') {
		return (<Outcome game={game.phase} statefn={statefn} />);
	}

	return (<></>);
}

// No idea
function Nav() {
	const links = [
		["Opponents", "/opponents"],
		["Abilities", "/abilities"],
		[    "Items",     "/items"],
	];

	const linkit = ([alias, uri]) => (
		<Link 
			key={uri} 
			className={
			[
				"h-16 basis-1/12",
				"border-solid border-black border-2",
				"flex-col place-content-center place-items-center"
			].join(' ')
			}
			href={uri}
		>
			<div className="font-bold">edit:</div>
			<div className="flex place-content-center place-items-center">{alias}</div>
		</Link>
	)

	return (
		<nav className={[
			"size-full mx-4 flex flex-row gap-4",
			"place-items-center",
			"bg-slate-300"].join(' ')}>

			{links.map(linkit)}
		</nav>
	);
}

