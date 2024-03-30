import Link from 'next/link';

export default async function Intro({ params, searchParams }) {
	return (
		<main className={
			[ "h-svh",
			, "flex flex-col"
			, "place-content-center place-items-center"
			].join(' ')}
		>
			<div className={
				[ "rounded-3xl"
				, "bg-gradient-to-b from-red-200 via-red-200 to-red-400"
				, "flex flex-col gap-6"
				, "place-content-center place-items-center"
				, "p-4"
				].join(' ')}
			>
				<h1 className="text-3xl font-bold">
					Lexical Clash
				</h1>

				<p>
					Use your powers of spelling and words to defeat opponents<br/>
					Collect score multipliers and special abilities<br/>
					Reach the boss and survive<br/>
					And have fun!<br/>
				</p>

				<Link className="text-6xl font-black" href="/play">
					Play!
				</Link>
			</div>
		</main>
	);
}
