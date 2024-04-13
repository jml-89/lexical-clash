declare module 'saxophone'

interface SaxTag {
	name: string
	attrs: string
	isSelfClosing: boolean
}

interface SaxText {
	contents: string
}

