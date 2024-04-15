'use server'

import Saxophone from 'saxophone'
import zlib from 'node:zlib'
import { pipeline } from 'node:stream/promises'
import fetch from 'node-fetch'

import { Pool } from 'pg'
const pool = new Pool()

export async function IsWordValid(word: string): Promise<boolean> {
	try { 
		const res = await pool.query({
			text: `
				select *
				from writtenform
				where form ilike $1;
			`, 
			values: [word]
		})
		return res.rowCount !== null && res.rowCount > 0
	} catch (e) {
		console.log("Database whoopsie uh oh")
		console.log(e)
		throw e
	}
}

// Check if $left is $relation of $right
// So for a hypernym, is left the hypernym of right? 
// and so on
//export type RelationFunc = (relation: string, left: string, right: string) => Promise<boolean>
export async function AreWordsRelated(relation: string, left: string, right: string): Promise<boolean> {
	const leftsynids = await getSynids(left)
	const rightsynids = await getSynids(right)
	for (const ls of leftsynids) {
		for (const rs of rightsynids) {
			if (await isRelatedSynid(relation, ls, rs)) {
				return true
			}
		}
	}
	
	return false
}

// For opponent words
export async function HypoForms(word: string): Promise<string[]> {
	const res = await pool.query({
		text: "select hypo from simplerelations where hyper = $1",
		values: [word]
	})

	return res.rows.map((row) => row.hypo)
}

export async function Candidates(lo: number, hi: number): Promise<string[]> {
	const res = await pool.query({
		text: `
			select hyper
			from simplerelations 
			group by hyper
			having count(*) > $1
			and count(*) < $2
			order by random();
		`,
		values: [lo, hi]
	})

	return res.rows.map((row) => row.hyper)
}

/*
export async function HypoForms(word: string): Promise<string[]> {
	const res = await pool.query({
		text: `
			with recursive lexids as (
				select lexid
				from writtenform
				where form ilike $1
			), synids as (
				select synid 
				from synsetmember 
				where memberid in (select lexid from lexids)
			), relations as (
				select 
					target
				from 
					synsetrelation
				where
					synid in (select synid from synids)
				and
					reltype like $2
					
				union

				select 
					a.target
				from 
					synsetrelation a
				inner join
					relations b
				on
					a.reltype like $2
				and
					a.synid = b.target
			), members as (
				select *
				from synsetmember 
				where synid in (
					select target 
					from relations
				)
			)
			select form 
			from writtenform 
			where lexid in (select memberid from members)
		`,
		values: [word, 'hyponym']
	})

	return res.rows.map((row) => row.form)
}
*/

// For the purposes of this simple game, return all matching synids
// Normally you would query by written form /and/ part of speech
// However you can't expect the player to have to choose that
// Just return everything
// Verb, noun, what have you -- better to cover more than less
async function getSynids(writtenform: string): Promise<string[]> {
	const res = await pool.query({
		text: `
			select synid 
			from synsetmember 
			where memberid in (
				select id 
				from lexicalentry 
				where id in (
					select lexid
					from writtenform 
					where form ilike $1
				)
			);`,
		values: [writtenform]
	})
	
	return res.rows.map((row) => row.synid)
}


// Check if $leftsynid is $relation of $rightsynid
// So for a hypernym, is left the hypernym of right? 
// and so on
export async function isRelatedSynid(relation: string, leftsynid: string, rightsynid: string): Promise<boolean> {
	const res = await pool.query({
		name: 'synrec',
		text: `
			with recursive relations as (
				select 
					target
				from 
					synsetrelation
				where
					synid = $1
				and
					reltype = $2
					
				union

				select 
					a.target
				from 
					synsetrelation a
				inner join
					relations b
				on
					a.reltype = $2
				and
					a.synid = b.target
			)
			select target
			from relations
			where target = $3;
		`,
		values: [rightsynid, relation, leftsynid]
	})

	return res.rows.length > 0 
}

export async function InitialiseDatabase(): Promise<void> {
	console.log("Initialising Database")

	interface SaxTagParsed {
		name: string
		attrs: Record<string, string>
	}

	let queries = new Map<string, string>()
	let queryArgs = new Map<string, string[][]>()

	function addQuery(name: string, text: string, values: string[]): void {
		if (!queries.has(name)) {
			queries.set(name, text)
		}

		if (!queryArgs.has(name)) {
			queryArgs.set(name, [])
		}
		let args = queryArgs.get(name) as string[][]
		args.push(values)
	}

	function wordIsGood(word: string): boolean {
		for (const c of word) {
			if (c < 'a' || c > 'z') {
				return false
			}
		}
		return true
	}

	let tagStack: SaxTagParsed[] = []
	const sax = new Saxophone();
	sax.on('tagopen', (tag: SaxTag): void => {
		const attrs = Saxophone.parseAttrs(tag.attrs)

		if (tag.name === 'Lemma') {
			addQuery('LexicalEntry',
				`insert into 
				LexicalEntry (id, partOfSpeech) 
				values ($1, $2) 
				on conflict do nothing;`,
				[ 
					tagStack[tagStack.length-1].attrs.id,
				 	attrs.partOfSpeech
				]
			)
		}

		if (tag.name === 'Form' || tag.name === 'Lemma') {
			if (wordIsGood(attrs.writtenForm)) {
				addQuery('WrittenForm',
					`insert into
					WrittenForm (lexid, form)
					values ($1, $2) 
					on conflict do nothing;`,
					[ 
						tagStack[tagStack.length-1].attrs.id,
						attrs.writtenForm
					]
				)
			}
		}

		if (tag.name === 'Synset') {
			addQuery('Synset',
				`insert into 
				Synset (id, ili, partOfSpeech) 
				values ($1, $2, $3) 
				on conflict do nothing;`,
				[
					attrs.id,
					attrs.ili,
					attrs.partOfSpeech
				]
			)

			for (const member of attrs.members.split(' ')) {
				addQuery('SynsetMember',
					`insert into 
					SynsetMember (synid, memberid) 
					values ($1, $2) 
					on conflict do nothing;`,
					[attrs.id, member]
				)
			}
		}

		if (tag.name === 'SynsetRelation') {
			addQuery('SynsetRelation',
				`insert into 
				SynsetRelation (synid, target, relType) 
				values ($1, $2, $3) 
				on conflict do nothing;`,
				[
					tagStack[tagStack.length-1].attrs.id,
					attrs.target, 
					attrs.relType
				]
			)
		}


		if (!tag.isSelfClosing) {
			tagStack.push({ name: tag.name, attrs: attrs})
		}
	})

	sax.on('text', (text: SaxText): void => {
		if (tagStack.length < 1) {
			return
		}

		const tag = tagStack[tagStack.length-1]
		const isText = tag.name === 'Definition'
			|| tag.name === 'Example'
			|| tag.name === 'ILIDefinition'
		if (isText) {
			addQuery('SynsetText',
				 `insert into
				 SynsetText (synid, nodename, content)
				 values ($1, $2, $3)
				 on conflict do nothing;`,
				 [
					tagStack[tagStack.length-2].attrs.id,
					tagStack[tagStack.length-1].name,
					text.contents
				 ]
			)
		}
	})

	sax.on('tagclose', (tag: SaxTag): void => {
		tagStack.pop()
	})

	console.log("Fetching Wordnet file")
	const resp = await fetch('https://storage.googleapis.com/lexical-clash-resources/wordnet.xml.gz')
	if (!resp.ok) {
		throw new Error(`Failed to fetch wordnet data ${resp.statusText}`)
	}
	if (resp.body === null) {
		throw new Error("Wordnet body is null")
	}

	console.log("Processing Wordnet file")
	await pipeline(
		resp.body, 
		zlib.createGunzip(), 
		sax
	)

	console.log("Initialisating database")
	await init()

	console.log("Adding data to database")
	const client = await pool.connect()
	try {

		for (const [query, entries] of queryArgs) {
			await client.query('BEGIN')

			console.log(`Running ${query} inserts`)
			const q = { 
				name: query,
				text: queries.get(query) as string,
				values: [] as string[]
			}
			for (const entry of entries) {
				q.values = entry
				await client.query(q)
			}

			await client.query('COMMIT')
		}

	} catch (e) {
		console.log('Something went wrong :(')
		await client.query('ROLLBACK')
		throw e
	} finally {
		client.release()
	}

	console.log("Cleaning up database")
	await cleanup()

	console.log("All done")
}

async function init(): Promise<void> {
	console.log("Dropping tables")
	await pool.query(`
		BEGIN;

		DROP TABLE IF EXISTS SynsetRelation;
		DROP TABLE IF EXISTS SynsetMember;
		DROP TABLE IF EXISTS SynsetText;
		DROP TABLE IF EXISTS WrittenForm;
		DROP TABLE IF EXISTS Synset;
		DROP TABLE IF EXISTS LexicalEntry;
		drop table if exists simplerelations; 

		COMMIT;
	`)

	console.log("Creating tables without indices or foreign keys")
	await pool.query(`
		begin;

		CREATE TABLE Synset (
			id TEXT,
			ili TEXT,
			partOfSpeech TEXT,
			PRIMARY KEY (id)
		);

		CREATE TABLE LexicalEntry (
			id TEXT,
			partOfSpeech TEXT,
			PRIMARY KEY (id)
		);

		CREATE TABLE WrittenForm (
			lexid TEXT,
			form TEXT,
			PRIMARY KEY (lexid, form)
		);

		CREATE TABLE SynsetMember (
			synid TEXT,
			memberid TEXT,
			PRIMARY KEY (synid, memberid)
		);

		CREATE TABLE SynsetText (
			synid TEXT,
			nodename TEXT,
			content TEXT
		);

		CREATE TABLE SynsetRelation (
			synid TEXT,
			target TEXT,
			relType TEXT
		);

		COMMIT;

		ANALYZE;
	`)
}

async function cleanup(): Promise<void> {
	console.log("Creating indices")
	await pool.query(`
		begin; 

		CREATE INDEX writtenform_lexid ON WrittenForm(lexid);
		CREATE INDEX SynsetMember_synid ON SynsetMember(synid);
		CREATE INDEX SynsetMember_memberid ON SynsetMember(memberid);
		CREATE INDEX SynsetText_synid ON SynsetText(synid);
		CREATE INDEX SynsetRelation_synid ON SynsetRelation(synid);
		CREATE INDEX SynsetRelation_target ON SynsetRelation(target);

		commit;

		ANALYZE;
	`)

	console.log("Trimming unsuitable words")
	await pool.query(`
		begin;

		create temporary table junk as (
			select distinct(id)
			from lexicalentry 
			where id not in (
				select lexid
				from writtenform
			)
		);
		alter table junk add primary key (id);

		delete from synsetmember where memberid in (select id from junk);
		delete from lexicalentry where id in (select id from junk);

		commit;

		analyze;
	`)

	console.log("Adding foreign key constraints")
	await pool.query(`
		begin;

		ALTER TABLE WrittenForm
		ADD CONSTRAINT WrittenFormFK
		FOREIGN KEY (lexid)
		REFERENCES LexicalEntry(id);

		ALTER TABLE SynsetMember
		ADD CONSTRAINT SynsetMemberFKL
		FOREIGN KEY (memberid)
		REFERENCES LexicalEntry(id);

		ALTER TABLE SynsetMember
		ADD CONSTRAINT SynsetMemberFKS
		FOREIGN KEY (synid)
		REFERENCES Synset(id);

		ALTER TABLE SynsetText
		ADD CONSTRAINT SynsetTextFK
		FOREIGN KEY (synid)
		REFERENCES Synset(id);

		ALTER TABLE SynsetRelation
		ADD CONSTRAINT SynsetRelationFK1
		FOREIGN KEY (synid)
		REFERENCES Synset(id);

		ALTER TABLE SynsetRelation
		ADD CONSTRAINT SynsetRelationFK2
		FOREIGN KEY (target)
		REFERENCES Synset(id);

		commit;

		ANALYZE;
	`)

	console.log("Creating simplerelations Table")
	await pool.query(`
		create table simplerelations as 
			with recursive lexids as (
				select form, lexid
				from writtenform
			), synids as (
				select 
					b.form,
					a.synid
				from 
					synsetmember a
				inner join 
					lexids b
				on
					a.memberid = b.lexid
			), relations as (
				select 
					b.form,
					a.target
				from 
					synsetrelation a
				inner join
					synids b
				on
					a.reltype = 'hyponym'
				and 
					a.synid = b.synid

				union

				select 
					b.form,
					a.target
				from 
					synsetrelation a
				inner join
					relations b
				on
					a.reltype = 'hyponym'
				and
					a.synid = b.target
			), outids as (
				select a.form, b.memberid
				from relations a
				inner join synsetmember b
				on a.target = b.synid
			)
			select b.form as hypo, a.form as hyper 
			from outids a
			inner join writtenform b
			on a.memberid = b.lexid;
		create index simplerelations_hypo on simplerelations(hypo);
		create index simplerelations_hyper on simplerelations(hyper);
		analyze;
		`
	)
}

