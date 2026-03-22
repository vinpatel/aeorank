import path from "path";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Required for @aeorank/core to be traced correctly in production builds
	outputFileTracingRoot: path.join(__dirname, "../../"),
	// Turbopack is default in Next.js 16
};

export default withSentryConfig(nextConfig, {
	silent: true,
	disableLogger: true,
});
