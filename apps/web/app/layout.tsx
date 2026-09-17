import { getClerkPublishableKey, warnIfClerkKeyMismatch } from "@/lib/clerk-env";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const instrument = Instrument_Serif({
	subsets: ["latin"],
	weight: "400",
	style: ["normal", "italic"],
	variable: "--font-serif",
});

export const metadata: Metadata = {
	title: "AEOrank Dashboard",
	description: "Score crawler access and extractability. 12 dimensions, 8 generated files. Sign in to scan a public URL.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const publishableKey = getClerkPublishableKey();
	warnIfClerkKeyMismatch(publishableKey);

	return (
		<ClerkProvider
			{...(publishableKey ? { publishableKey } : {})}
			signInUrl="/sign-in"
			signUpUrl="/sign-up"
			afterSignOutUrl="https://aeorank.dev"
		>
			<html lang="en">
				<body className={`${inter.variable} ${jetbrains.variable} ${instrument.variable}`}>
					{children}
				</body>
			</html>
		</ClerkProvider>
	);
}
