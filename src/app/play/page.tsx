import Link from 'next/link';

import { IsWordValid, AreWordsRelated, HypoForms, Candidates } from '@/lib/wordnet'
import { serverSeed } from '@/lib/serveronly';
import { KnowledgeBase } from '@/lib/util'

import { Game } from './game';

export default async function Home() {
	const wordnet: KnowledgeBase = {
		valid: IsWordValid,
		related: AreWordsRelated,
		hypos: HypoForms,
		candidates: Candidates
	}
	return (
		<Game seed={await serverSeed()} knowledge={wordnet} />
	);
}
