import Link from 'next/link';

import { ScoreWord } from '@/lib/score.ts';
import { Game } from './game.tsx';

export default async function Home({ params, searchParams }) {
	return (
		<main>
			<Game wordchecker={ScoreWord} />
		</main>
	);
}
