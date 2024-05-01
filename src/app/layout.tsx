import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lexical Clash",
  description: "Browser-based word game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-dvh h-full bg-slate-800 flex flex-col justify-between">
          <nav className="flex-none bg-slate-900 text-3xl text-amber-400 tracking-tighter font-extralight ">
            <Link href="/">Lexical Clash</Link>
          </nav>

          {children}

          <div className="flex-none flex flex-row justify-end bg-slate-900 text-amber-300 p-1 gap-2">
            <div className="text-lg">
              <a href="https://github.com/jml-89/lexical-clash" target="_blank">
                source: github/jml-89
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
