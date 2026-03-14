import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Required for @aeorank/core to be traced correctly in production builds
	outputFileTracingRoot: path.join(__dirname, "../../"),
	// Turbopack is default in Next.js 16
};

export default nextConfig;
