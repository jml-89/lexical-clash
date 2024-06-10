import Link from "next/link";

// Need this to be dynamic for the random session id generation
// (really should be done somewhere else... in time)
export const dynamic = "force-dynamic";

export default async function Intro() {
  let sesh = "/";
  for (let i = 0; i < 10; i++) {
    const abc = "qwerasdfzxcvtyuighjkbnmopl1234567890";
    sesh += abc[Math.floor(Math.random() * abc.length)];
  }

  return (
    <main className="flex-1 flex flex-col bg-[url('/bg/main.jpg')] bg-center bg-cover">
      <div className="flex-1 flex flex-col self-stretch justify-center items-center gap-4 backdrop-blur-sm backdrop-brightness-50">
        <FatLink href={sesh}>Adventure</FatLink>
        <FatLink href="/about">About</FatLink>
      </div>
    </main>
  );
}

function FatLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="p-4 text-6xl text-white font-light tracking-tight backdrop-blur-lg bg-black/50 rounded-lg border border-black shadow-lg shadow-slate-900"
      href={href}
    >
      {children}
    </Link>
  );
}
