import Link from 'next/link';

export default async function Intro() {
	return (
		<main className="text-amber-400 flex flex-col justify-between items-center gap-2">
			<div className="flex flex-col items-baseline gap-2">
				<h1 className="text-3xl font-light tracking-tight">How to Play</h1>
				<p>
					You are entering a word battle against fantastical opposition.<br/>
					Each round your opponent will place down a word.<br/>
					You must place a better word or lose health.<br/>
					The battle will continue until you or your opponent run out of health.<br/>
					<br/>
					Tap letters to arrange them into a word.<br/>
					Tap the check word button to see if it is valid.<br/>
					If the word is valid, a word score will be presented.<br/>
					If the word score is satisfactory, press attack!<br/>
					<br/>
					Use abilities to improve your chances.<br/>
					Embrace bonuses to improve your word scores.<br/>
				</p>

				<h1 className="text-3xl font-light tracking-tight">Strengths and Weaknesses</h1>
				<p>
					Each opponent you face has a set of words they use, and words they are weak to<br/>
					Attacking your opponents weakness makes your word far more powerful.<br/>
					<br/>
					These are based upon WordNets hypernym/hyponym relations.<br/>
					Examples follow for illuminative purposes.<br/>
					Let us consider an opponent weak to <span className="text-lime-300">food</span>.<br/>
					Hit that opponent with <span className="font-medium">pasta</span> and deliver double the value of that word!<br/>
				</p>
			</div>

			<Link className="m-4 text-6xl font-extralight tracking-tighter ring-4 ring-amber-300 bg-red-800 rounded-lg p-4" href="/play">
				Play!
			</Link>
		</main>
	);
}
