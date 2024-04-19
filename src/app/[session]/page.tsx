import Link from 'next/link';

import { 
	IsWordValid, 
	AreWordsRelated, 
	HypoForms, 
	Candidates, 
	GetSession, 
	SetSession
} from '@/lib/wordnet'
import { serverSeed } from '@/lib/serveronly';
import { KnowledgeBase } from '@/lib/util'

import { Game } from './game';

export default async function Home({ params }: { 
	params: { 
		session: string 
	}
}) {
	const session = await GetSession(params.session)
	const wordnet: KnowledgeBase = {
		valid: IsWordValid,
		related: AreWordsRelated,
		hypos: HypoForms,
		candidates: Candidates,
		save: SetSession
	}

	return (
		<Game sid={params.session} seed={await serverSeed()} save={session} knowledge={wordnet} />
	);
}
