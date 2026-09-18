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
	metadataBase: new URL("https://app.aeorank.dev"),
	title: "AEOrank Dashboard",
	description:
		"Score crawler access and extractability. 12 dimensions, 8 generated files. Sign in to scan a public URL.",
	icons: {
		icon: [
			{ url: "/favicon.svg", type: "image/svg+xml" },
			{ url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
			{ url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
			{ url: "/icon-512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
	},
	openGraph: {
		siteName: "AEOrank",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "AEOrank",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		images: ["/og-image.png"],
	},
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
