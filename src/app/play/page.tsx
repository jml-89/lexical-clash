import Link from 'next/link';

import { ScoreWord } from '@/lib/score.ts';
import { serverSeed } from '@/lib/serveronly.ts';
import { Game } from './game.tsx';

export default async function Home({ params, searchParams }) {
	return (
		<Game seed={await serverSeed()} wordchecker={ScoreWord} />
	);
}
