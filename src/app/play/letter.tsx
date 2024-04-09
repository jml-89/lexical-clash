import { Letter } from '@/lib/letter'

export function DrawLetter({ letter, small = false }: {
	letter: Letter,
	small: boolean
}) {
	// to satisfy tailwindcss
	const dimensions = small ? 'w-8 h-8 border-2' : 'w-12 h-12 border-4'
	const textSize = small ? 'text-xl' : 'text-3xl'
	const [bg, bo] = 
		letter.level === 4 ? 
			['bg-fuchsia-400', 'border-rose-700'] 
		: letter.level === 3 ? 
			['bg-amber-500', 'border-amber-700'] 
		: letter.level === 2 ?
			['bg-slate-400', 'border-slate-600'] 
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

