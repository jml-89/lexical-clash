'use client'

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { 
	Outcome,

	NewGame, 

	PhaseFn,
	Mutate	
} from '@/lib/game';

import { KnowledgeBase } from '@/lib/util'
import { Preamble } from '@/lib/preamble'
import { Battle } from '@/lib/battle'

import { PlayBattle } from './battle';
import { ShowPreamble } from './preamble';
import { ShowOutcome } from './outcome';

export function Game({ seed, knowledge }: { 
	seed: number, 
	knowledge: KnowledgeBase
}) {
	const [game, setGame] = useState(NewGame(seed));

	const mutator = useCallback(
		async function(fn: PhaseFn): Promise<void> {
			await Mutate(game, knowledge, fn, setGame)
	}, [game, setGame, knowledge])

	if (game.phase.type === 'preamble') {
		return (<ShowPreamble preamble={game.phase} statefn={mutator} />);
	}

	if (game.phase.type === 'battle') {
		return (<PlayBattle game={game.phase} statefn={mutator} />);
	}

	if (game.phase.type === 'outcome') {
		return (<ShowOutcome outcome={game.phase} statefn={mutator} />);
	}

	return (<></>);
}

