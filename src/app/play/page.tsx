import Link from 'next/link';

import { IsWordValid, AreWordsRelated, HypoForms } from '@/lib/wordnet'
import { serverSeed } from '@/lib/serveronly';
import { KnowledgeBase } from '@/lib/util'

import { Game } from './game';

// { params, searchParams }
export default async function Home() {
	const wordnet: KnowledgeBase = {
		valid: IsWordValid,
		related: AreWordsRelated,
		hypos: HypoForms
	}
	return (
		<Game seed={await serverSeed()} knowledge={wordnet} />
	);
}
