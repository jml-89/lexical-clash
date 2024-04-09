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
			<div className="min-h-dvh h-full bg-slate-800 flex flex-col justify-between">
				<nav className="flex-none bg-slate-900 text-3xl text-amber-400 tracking-tighter font-extralight ">
					<h1>Lexical Clash</h1>
				</nav>

				{children}

				<div className="flex-none flex flex-row-reverse bg-slate-900">
					<div className="text-lg text-amber-300 mx-2">/jml-89</div>
				</div>
			</div>
		</body>
	</html>
  );
}
