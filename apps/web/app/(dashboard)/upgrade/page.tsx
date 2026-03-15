import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { PLANS } from "@/lib/stripe";
import { CheckoutButton } from "@/components/CheckoutButton";

/**
 * Upgrade page — shows Free, Pro, and API tier cards.
 * Server Component: fetches the user's current subscription from Supabase.
 * Paid users see "Current plan" instead of a checkout button.
 */
export default async function UpgradePage() {
	const { userId } = await auth();

	// Fetch current subscription (null means Free tier)
	let currentPlan: string = "free";
	if (userId) {
		const supabase = createServerSupabaseClient();
		const { data } = await supabase
			.from("subscriptions")
			.select("plan, status")
			.eq("user_id", userId)
			.eq("status", "active")
			.maybeSingle();

		if (data?.plan) {
			currentPlan = data.plan;
		}
	}

	const tiers = [
		{
			key: "free",
			name: PLANS.free.name,
			price: "$0",
			period: "forever",
			features: [
				`${PLANS.free.scansPerMonth} scans per month`,
				"AEO score + letter grade",
				"All 8 generated files",
				"Basic dashboard",
			],
			priceId: null,
		},
		{
			key: "pro",
			name: PLANS.pro.name,
			price: "$29",
			period: "per month",
			features: [
				`${PLANS.pro.scansPerMonth} scans per month`,
				"Everything in Free",
				"Score history chart",
				"File download (ZIP)",
				"Priority support",
			],
			priceId: PLANS.pro.priceId ?? null,
		},
		{
			key: "api",
			name: PLANS.api.name,
			price: "$99",
			period: "per month",
			features: [
				`${PLANS.api.scansPerMonth} scans per month`,
				"Everything in Pro",
				"REST API access",
				"Webhook notifications",
				"Team seats (coming soon)",
			],
			priceId: PLANS.api.priceId ?? null,
		},
	];

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

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
					gap: "20px",
					maxWidth: "900px",
				}}
			>
				{tiers.map((tier) => {
					const isCurrentPlan = currentPlan === tier.key;
					const isPro = tier.key === "pro";

					return (
						<div
							key={tier.key}
							style={{
								border: isPro ? "2px solid var(--bg-accent)" : "1px solid var(--border)",
								borderRadius: "var(--radius-lg)",
								padding: "28px",
								display: "flex",
								flexDirection: "column",
								gap: "20px",
								backgroundColor: "var(--bg-card)",
								position: "relative",
								boxShadow: isPro ? "var(--shadow-lg)" : "var(--shadow-card)",
								transition: "box-shadow 0.2s ease, transform 0.2s ease",
							}}
						>
							{isPro && (
								<div
									style={{
										position: "absolute",
										top: "-12px",
										left: "50%",
										transform: "translateX(-50%)",
										background: "var(--bg-accent)",
										color: "#fff",
										fontSize: "11px",
										fontWeight: 700,
										letterSpacing: "0.08em",
										textTransform: "uppercase",
										padding: "4px 14px",
										borderRadius: "999px",
									}}
								>
									Most popular
								</div>
							)}

							<div>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "8px",
										marginBottom: "10px",
									}}
								>
									<span style={{ fontSize: "17px", fontWeight: 700, fontFamily: "var(--font-display)" }}>
										{tier.name}
									</span>
									{isCurrentPlan && (
										<span
											style={{
												fontSize: "11px",
												fontWeight: 600,
												padding: "2px 8px",
												borderRadius: "999px",
												backgroundColor: "var(--green-bg)",
												color: "var(--green)",
											}}
										>
											Current plan
										</span>
									)}
								</div>
								<div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
									<span style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: 700, letterSpacing: "-0.02em" }}>
										{tier.price}
									</span>
									<span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
										/ {tier.period}
									</span>
								</div>
							</div>

							<ul
								style={{
									listStyle: "none",
									padding: 0,
									margin: 0,
									display: "flex",
									flexDirection: "column",
									gap: "10px",
									flex: 1,
								}}
							>
								{tier.features.map((feature) => (
									<li
										key={feature}
										style={{
											fontSize: "14px",
											color: "var(--text-secondary)",
											display: "flex",
											alignItems: "flex-start",
											gap: "10px",
										}}
									>
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
											<circle cx="8" cy="8" r="7" fill="var(--green-bg)"/>
											<path d="M5.5 8L7.2 9.7L10.5 6.3" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
										{feature}
									</li>
								))}
							</ul>

							<div>
								{isCurrentPlan ? (
									<div
										style={{
											textAlign: "center",
											padding: "11px",
											border: "1px solid var(--border)",
											borderRadius: "var(--radius-sm)",
											fontSize: "14px",
											color: "var(--text-muted)",
											fontWeight: 500,
										}}
									>
										Active plan
									</div>
								) : tier.priceId ? (
									<CheckoutButton
										priceId={tier.priceId}
										plan={tier.key}
										label={`Upgrade to ${tier.name}`}
									/>
								) : (
									<div
										style={{
											textAlign: "center",
											padding: "11px",
											border: "1px solid var(--border)",
											borderRadius: "var(--radius-sm)",
											fontSize: "14px",
											color: "var(--text-muted)",
											fontWeight: 500,
										}}
									>
										Free forever
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
