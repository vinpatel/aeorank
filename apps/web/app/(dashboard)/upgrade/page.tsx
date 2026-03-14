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
		<div>
			<div style={{ marginBottom: "32px" }}>
				<h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 8px" }}>
					Plans &amp; Pricing
				</h1>
				<p style={{ color: "#6b7280", margin: 0 }}>
					Choose the plan that fits your AEO workflow.
				</p>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
					gap: "24px",
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
								border: isPro ? "2px solid #111" : "1px solid #e5e7eb",
								borderRadius: "8px",
								padding: "28px",
								display: "flex",
								flexDirection: "column",
								gap: "20px",
								backgroundColor: "#fff",
								position: "relative",
							}}
						>
							{isPro && (
								<div
									style={{
										position: "absolute",
										top: "-12px",
										left: "50%",
										transform: "translateX(-50%)",
										backgroundColor: "#111",
										color: "#fff",
										fontSize: "11px",
										fontWeight: 700,
										letterSpacing: "0.08em",
										textTransform: "uppercase",
										padding: "3px 12px",
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
										marginBottom: "8px",
									}}
								>
									<span style={{ fontSize: "16px", fontWeight: 700 }}>
										{tier.name}
									</span>
									{isCurrentPlan && (
										<span
											style={{
												fontSize: "11px",
												fontWeight: 600,
												padding: "2px 8px",
												borderRadius: "4px",
												backgroundColor: "#dcfce7",
												color: "#166534",
											}}
										>
											Current plan
										</span>
									)}
								</div>
								<div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
									<span style={{ fontSize: "32px", fontWeight: 800 }}>
										{tier.price}
									</span>
									<span style={{ color: "#6b7280", fontSize: "14px" }}>
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
									gap: "8px",
									flex: 1,
								}}
							>
								{tier.features.map((feature) => (
									<li
										key={feature}
										style={{
											fontSize: "14px",
											color: "#374151",
											display: "flex",
											alignItems: "flex-start",
											gap: "8px",
										}}
									>
										<span style={{ color: "#16a34a", flexShrink: 0, marginTop: "1px" }}>
											&#10003;
										</span>
										{feature}
									</li>
								))}
							</ul>

							<div>
								{isCurrentPlan ? (
									<div
										style={{
											textAlign: "center",
											padding: "10px",
											border: "1px solid #e5e7eb",
											borderRadius: "6px",
											fontSize: "14px",
											color: "#6b7280",
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
											padding: "10px",
											border: "1px solid #e5e7eb",
											borderRadius: "6px",
											fontSize: "14px",
											color: "#6b7280",
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
