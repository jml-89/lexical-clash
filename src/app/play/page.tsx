import Link from 'next/link';

import { ScoreWord } from '@/lib/score';
import { serverSeed } from '@/lib/serveronly';
import { Game } from './game';

// { params, searchParams }
export default async function Home() {
	return (
		<Game seed={await serverSeed()} scorefn={ScoreWord} />
	);
}
