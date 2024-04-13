import Link from 'next/link';

export default async function Intro() {
	return (
		<main className="text-amber-400 flex flex-col justify-between gap-2">
			<div className="flex flex-col">
				<div className="bg-slate-800">
					<h1 className="mx-2 text-2xl font-light">How to Play</h1>
				</div>
				<p className="mx-4">
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
			</div>

			<div className="flex flex-col">
				<div className="bg-slate-800">
					<h1 className="mx-2 text-2xl font-light">Strengths and Weaknesses</h1>
				</div>
				<p className="mx-4">
					Each opponent you face has a unique set of strengths and weaknesses.<br/>
					Attacking your opponents weakness makes your word far more powerful.<br/>
					Likewise, stay away from your opponents strengths.<br/>
					<br/>
					These are based upon WordNets hypernym/hyponym relations.<br/>
					Examples follow for illuminative purposes.<br/>
					Let us consider an opponent weak to <span className="text-lime-300">food</span>.<br/>
					And word you write which is detected as a type of food will gain an extra multiplier.<br/>
					This a simple word like <span className="font-medium">pasta</span> suddenly becomes very powerful!<br/>
				</p>
			</div>

			<Link className="m-4 text-6xl font-extralight tracking-tighter ring-4 ring-amber-300 bg-red-800 rounded-lg p-4" href="/play">
				Play!
			</Link>
			<Link className="self-end rounded-lg bg-slate-600 p-2 m-2" href="/init">
				Init
			</Link>
		</main>
	);
}
