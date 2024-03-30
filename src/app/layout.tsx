import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
			<div className="h-svh w-screen bg-gradient-to-b from-slate-600 to-slate-800">
			{children}
			</div>
		</body>
	</html>
  );
}
