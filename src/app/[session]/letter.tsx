import { Letter } from '@/lib/letter'

export function DrawLetter({ letter, small = false }: {
	letter: Letter | undefined,
	small: boolean
}) {
	// to satisfy tailwindcss, need full classNames
	const dimensions = small ? 'w-8 h-8 border-2' : 'w-12 h-12 border-4'

	// in a hand, present an empty slot of appropriate size
	if (!letter) {
		return <div className={`${dimensions} border-none`} />
	}

	const textSize = small ? 'text-xl' : 'text-3xl'
	const [bg, bo] = 
		letter.level === 5 ? 
			['bg-amber-300', 'border-amber-400'] 
		: letter.level === 4 ? 
			['bg-purple-300', 'border-purple-400'] 
		: letter.level === 3 ?
			['bg-sky-300', 'border-sky-400'] 
		: letter.level === 2 ?
			['bg-teal-300', 'border-teal-400']
		: // letter.level == 1 or something else who knows
			['bg-stone-400', 'border-stone-600'] 

	return (
		<div className={[dimensions, "border-solid"
				, bg, bo, "p-0.5",
				,"shadow-sm shadow-zinc-400"
				,"grid grid-cols-3 grid-rows-3"].join(' ')}
		>
			<div className={
				["row-start-1 col-start-1 row-span-3 col-span-2"
				, textSize, "font-bold" 
				].join(' ')}
			>
				{letter.char}
			</div>
			<div className={["row-start-3 col-start-3 self-end"
					,"text-xs font-light"
					].join(' ')}
			>
				{letter.score}
			</div>
		</div>
	);
}

