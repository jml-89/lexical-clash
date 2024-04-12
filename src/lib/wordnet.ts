'use server'

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

