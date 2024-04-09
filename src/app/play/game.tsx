'use client'

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { 
	Outcome,

	NewGame, 
	PreambleFn,
	BattleFn,
	OutcomeFn
} from '@/lib/game';

import { ScoreFunc } from '@/lib/score'
import { Preamble } from '@/lib/preamble'
import { Battle } from '@/lib/battle'

import { PlayBattle } from './battle';
import { ShowPreamble } from './preamble';
import { ShowOutcome } from './outcome';

export function Game({ seed, scorefn }: { 
	seed: number, 
	scorefn: ScoreFunc
}) {
	const [game, setGame] = useState(NewGame(seed));

	const preambleFn = useCallback(
		async function(fn: (p: Preamble) => void): Promise<void> {
			const ng = await PreambleFn(game, scorefn, fn)
			setGame(ng)
	}, [game, setGame, scorefn])

	const battleFn = useCallback(
		async function(fn: (b: Battle) => void): Promise<void> {
			const ng = await BattleFn(game, scorefn, fn)
			setGame(ng)
	}, [game, setGame, scorefn])

	const outcomeFn = useCallback(
		async function(fn: (o: Outcome) => void): Promise<void> {
			const ng = await OutcomeFn(game, fn)
			setGame(ng)
	}, [game, setGame])

	if (game.phase.type === 'preamble') {
		return (<ShowPreamble preamble={game.phase} statefn={preambleFn} />);
	}

	if (game.phase.type === 'battle') {
		return (<PlayBattle game={game.phase} statefn={battleFn} />);
	}

	if (game.phase.type === 'outcome') {
		return (<ShowOutcome outcome={game.phase} statefn={outcomeFn} />);
	}

	return (<></>);
}

