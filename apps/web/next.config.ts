import path from "node:path";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import { checkoutAliasRedirects } from "./lib/checkout-plan";

const nextConfig: NextConfig = {
	// Required for @aeorank/core to be traced correctly in production builds
	outputFileTracingRoot: path.join(__dirname, "../../"),
	// Turbopack is default in Next.js 16
	async redirects() {
		return checkoutAliasRedirects();
	},
};

export default withSentryConfig(nextConfig, {
	silent: true,
	disableLogger: true,
});
