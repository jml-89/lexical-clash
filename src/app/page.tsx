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
    <main className="text-amber-400 text-sm flex flex-col justify-between items-center gap-2 p-1">
      <FatLink href={sesh}>Adventure</FatLink>
      <FatLink href="/about">About</FatLink>
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
      className="m-4 text-6xl font-light tracking-tighter shadow-amber-500 shadow bg-red-800 rounded-lg p-4"
      href={href}
    >
      {children}
    </Link>
  );
}
