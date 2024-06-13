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
          <div className="w-dvw min-h-dvh h-full bg-slate-800 text-amber-400 flex flex-col justify-between">
            {children}
          </div>
        </body>
      </StrictMode>
    </html>
  );
}
