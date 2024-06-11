import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Link from "next/link";
import { StrictMode } from "react";

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
      <StrictMode>
        <body className={inter.className}>
          <div className="w-dvw h-dvh bg-slate-800 text-amber-400 flex flex-col justify-between">
            <nav className="flex flex-row justify-between items-baseline bg-slate-900">
              <Link
                href="/"
                className="text-3xl tracking-tighter font-extralight"
              >
                Lexical Clash
              </Link>
              <a href="https://github.com/jml-89/lexical-clash" target="_blank">
                source: github/jml-89
              </a>
            </nav>

            {children}
          </div>
        </body>
      </StrictMode>
    </html>
  );
}
