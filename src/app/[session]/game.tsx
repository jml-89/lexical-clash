'use client'

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { 
	GameState,
	Outcome,

	NewGame, 
	LoadGame,

	Phase,
	PhaseFn,
	Finalise
} from '@/lib/game';

import { KnowledgeBase } from '@/lib/util'
import { Preamble } from '@/lib/preamble'
import { Battle } from '@/lib/battle'

import { PlayBattle } from './battle';
import { ShowPreamble } from './preamble';
import { ShowOutcome } from './outcome';

export function Game({ sid, seed, save, knowledge }: { 
	sid: string,
	seed: number,
	save: Object | undefined,
	knowledge: KnowledgeBase
}) {
	const [game, setGame] = useState(
		save === undefined ? 
		NewGame(sid, seed, knowledge) :
		LoadGame(save, knowledge)
	)

	const finaliser = useCallback(
		async function(p: Phase): Promise<void> {
			await Finalise(game, setGame, p)
	}, [game, setGame])

	if (game.phase.type === 'preamble') {
		return (<ShowPreamble preamble={game.phase} endfn={finaliser} />);
	}

	if (game.phase.type === 'battle') {
		return (<PlayBattle game={game.phase} endfn={finaliser} />);
	}

	if (game.phase.type === 'outcome') {
		return (<ShowOutcome outcome={game.phase} endfn={finaliser} />);
	}

	return (<></>);
}
