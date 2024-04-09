'use server'

import { Pool } from 'pg'
const pool = new Pool()

export async function WordCheck(word: string): Promise<boolean> {
	//console.log(`Is ${word} in the db?`)
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

// For the purposes of this simple game, return all matching synids
// Normally you would query by written form /and/ part of speech
// However you can't expect the player to have to choose that
// Just return everything
// Verb, noun, what have you -- better to cover more than less
export async function getSynids(writtenform: string): Promise<string[]> {
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

// Check if $left is $relation of $right
// So for a hypernym, is left the hypernym of right? 
// and so on
export async function isRelatedWords(relation: string, left: string, right: string): Promise<boolean> {
	const leftsynids = await getSynids(left)
	const rightsynids = await getSynids(right)
	for (const ls of leftsynids) {
		for (const rs of rightsynids) {
			if (await isRelated(relation, ls, rs)) {
				return true
			}
		}
	}
	
	return false
}

// Check if $leftsynid is $relation of $rightsynid
// So for a hypernym, is left the hypernym of right? 
// and so on
export async function isRelated(relation: string, leftsynid: string, rightsynid: string): Promise<boolean> {
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

