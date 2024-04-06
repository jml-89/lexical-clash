'use client'

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { NewGame, NextPreamble, EndPreamble, WithCopy } from '@/lib/game.ts';

import { Battle } from './battle.tsx';
import { Preamble } from './preamble.tsx';
import { Outcome } from './outcome.tsx';

export function Game({ seed, wordchecker }) {
	const [game, setGame] = useState(NewGame(seed));
	const statefn = useCallback(async (fn) => {
		setGame(await WithCopy(game, wordchecker, fn));
	})

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

