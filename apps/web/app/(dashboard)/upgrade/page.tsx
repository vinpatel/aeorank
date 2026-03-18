"use client";

import { PricingTable } from "@clerk/nextjs";

/**
 * Upgrade page — uses Clerk's PricingTable component for billing.
 * Configure your plans in the Clerk Dashboard under Billing.
 * Clerk handles checkout, subscriptions, and plan management.
 */
export default function UpgradePage() {
	return (
		<div style={{ animation: "fadeIn 0.3s ease" }}>
			<div style={{ marginBottom: "40px" }}>
				<h1 style={{
					fontFamily: "var(--font-display)",
					fontSize: "28px",
					fontWeight: 700,
					margin: "0 0 8px",
					letterSpacing: "-0.02em",
				}}>
					Plans & Pricing
				</h1>
				<p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "15px" }}>
					Choose the plan that fits your AEO workflow.
				</p>
			</div>

			<div style={{ maxWidth: "900px" }}>
				<PricingTable />
			</div>
		</div>
	);
}
