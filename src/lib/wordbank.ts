// A battery of words to use/re-use/enjoy

import { Letter } from './letter'

export interface WordBooster {
	// Hypernym 
	theme: string

	// How many words to include
	len: number

	// Minimum and max length for words picked
	lo: number
	hi: number
}

