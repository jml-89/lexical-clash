import Link from "next/link";

interface Ramble {
  title: string;
  body: string;
}

const basics: Ramble[] = [
  {
    title: "Adventure?",
    body: `
    There's not much to it, just tap the buttons that appear.
    Sometimes there's even a choice.
	`,
  },

  {
    title: "Battle?",
    body: `
    It's simple, put together better words than your opponent.

		Each round your opponent will place down a word.
		You must place a better word, or lose health.
		The battle will continue until you or your opponent run out of health.

		Use abilities to improve your word building capability.
		Embrace bonuses to improve your word scores.
    Use the wordbank to get suggestions.
	`,
  },

  {
    title: "Weaknesses?",
    body: `
		Each opponent you face has words they use and words they are weak to.
		Attacking your opponent's weakness makes your word far more powerful.
		
		These are based upon WordNet's hypernym/hyponym relations.
		Examples follow for illuminative purposes.
		Let us consider an opponent weak to food.
		Hit that opponent with 'pasta' to deliver double damage!
	`,
  },

  {
    title: "Wordnet?",
    body: `
		The word database used for this game is WordNet® 
		Nouns, verbs, adjectives and adverbs are grouped into sets of cognitive synonyms (synsets), each expressing a distinct concept.
		Synsets are interlinked by means of conceptual-semantic and lexical relations.

		WordNet superficially resembles a thesaurus, in that it groups words together based on their meanings.
		However, there are some important distinctions.
		First, WordNet interlinks not just word forms—strings of letters—but specific senses of words.
		As a result, words that are found in close proximity to one another in the network are semantically disambiguated.
		Second, WordNet labels the semantic relations among words, whereas the groupings of words in a thesaurus does not follow any explicit pattern other than meaning similarity.

		There are loads of words that WordNet just doesn't have. 
    You can generally rely it on to have nouns, verbs, adjectives.
    Any other class of word, don't be surprised if WordNet does not have it
    After all, how would those words be worked into a hypernym/hyponym relationship?
	`,
  },
];

// It may have been a better idea to just use remark & remark-html etc.
// I avoided that because it requires the use of setinnerhtmldangerously, not my cup of tea
function processBody(s: string): React.ReactNode {
  const lines = s.split(/\r?\n/);

  let lo = 0;
  while (lines[lo].trim() === "") {
    lo++;
  }

  let hi = lines.length - 1;
  while (lines[hi].trim() === "") {
    hi--;
  }

  return (
    <p className="text-wrap">
      {lines.slice(lo, hi + 1).flatMap((line, i) => [line, <br key={i} />])}
    </p>
  );
}

export default async function Intro() {
  let sesh = "";
  for (let i = 0; i < 10; i++) {
    const abc = "qwerasdfzxcvtyuighjkbnmopl1234567890";
    sesh += abc[Math.floor(Math.random() * abc.length)];
  }

  return (
    <main className="text-amber-400 text-sm flex flex-col justify-between items-start gap-2 p-2">
      <div className="flex flex-col items-baseline gap-2">
        {basics.map((x) => (
          <div key={x.title} className="flex flex-col items-baseline">
            <h1 className="text-3xl font-light tracking-tight">{x.title}</h1>
            <div className="px-1">{processBody(x.body)}</div>
          </div>
        ))}

        <div className="flex flex-col items-baseline">
          <div className="text-2xl">Source?</div>
          <a
            className="px-1 text-lime-400 underline"
            href="https://github.com/jml-89/lexical-clash"
          >
            github.com/jml-89/lexical-clash
          </a>
        </div>
        <div className="flex flex-col items-baseline font-mono">
          <h1 className="font-sans text-2xl">Version?</h1>
          <div className="px-1">{process.env.NEXT_PUBLIC_GIT_REF}</div>
          <div className="px-1">{process.env.NEXT_PUBLIC_GIT_HASH}</div>
        </div>
      </div>

      <Link
        className="m-4 text-6xl font-light tracking-tighter ring-4 ring-amber-300 bg-red-800 rounded-lg p-4"
        href="/"
      >
        Back
      </Link>
    </main>
  );
}
