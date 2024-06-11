import Link from "next/link";

export default async function Intro() {
  return (
    <main className="flex-1 flex flex-col bg-[url('/bg/main.jpg')] bg-center bg-cover">
      <div className="flex-1 flex flex-col self-stretch justify-center items-center gap-4 backdrop-brightness-50">
        <FatLink href="/play">Adventure</FatLink>
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
