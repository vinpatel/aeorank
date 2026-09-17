import { CheckoutButton } from "@/components/CheckoutButton";
import {
	type PaidPlanSlug,
	getStripePriceIdForPaidPlan,
	internalKeyToPaidSlug,
	parsePaidPlanSlug,
} from "@/lib/checkout-plan";
import { getCurrentPlan } from "@/lib/plan";
import { PLANS } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";

/**
 * Canonical checkout URL: /upgrade
 * Aliases: /pricing /billing /checkout /settings/billing
 * Paid query: ?plan=pro|agency
 */
export default async function UpgradePage({
	searchParams,
}: {
	searchParams: Promise<{ plan?: string; checkout?: string }>;
}) {
	const params = await searchParams;
	const selectedPlan = parsePaidPlanSlug(params.plan);
	const checkoutState = params.checkout;
	const { userId } = await auth();
	const currentPlan = await getCurrentPlan();
	const currentPaidSlug = internalKeyToPaidSlug(currentPlan);

	const proPriceId = getStripePriceIdForPaidPlan("pro");
	const agencyPriceId = getStripePriceIdForPaidPlan("agency");

	const tiers: {
		slug: "free" | PaidPlanSlug;
		name: string;
		price: string;
		period: string;
		features: string[];
		featured?: boolean;
	}[] = [
		{
			slug: "free",
			name: PLANS.free.name,
			price: "$0",
			period: "forever",
			features: [
				`${PLANS.free.scansPerMonth} scans per month`,
				`${PLANS.free.maxSites} site`,
				"AEO score + letter grade",
				"All 8 generated files (ZIP)",
				"Unlimited local CLI",
			],
		},
		{
			slug: "pro",
			name: PLANS.pro.name,
			price: "$29",
			period: "per month",
			featured: true,
			features: [
				`${PLANS.pro.scansPerMonth} scans per month`,
				`${PLANS.pro.maxSites} sites`,
				"Everything in Free",
				"Score history from your scans",
				"Auto-rescan (daily / weekly / monthly)",
			],
		},
		{
			slug: "agency",
			name: PLANS.api.name,
			price: "$99",
			period: "per month",
			features: [
				`${PLANS.api.scansPerMonth} scans per month`,
				`${PLANS.api.maxSites} sites`,
				"Everything in Pro",
				"Volume for agency audits",
				"Same 8 files · same 36 checks",
			],
		},
	];

	return (
		<div style={{ animation: "fadeIn 0.3s ease" }}>
			<div style={{ marginBottom: "40px" }}>
				<h1
					style={{
						fontFamily: "var(--font-display)",
						fontSize: "28px",
						fontWeight: 700,
						margin: "0 0 8px",
						letterSpacing: "-0.02em",
					}}
				>
					Plans & Pricing
				</h1>
				<p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "15px" }}>
					Choose the plan that fits your AEO workflow. Same 36 checks and 8 files on every plan. Pro is $29/mo. Agency is $99/mo.
				</p>
			</div>

			{checkoutState === "success" && (
				<p
					className="text-sm"
					style={{
						marginBottom: "20px",
						padding: "12px 14px",
						borderRadius: "8px",
						background: "var(--ok-fog)",
						color: "var(--ok)",
					}}
				>
					Payment received. Your plan will update as soon as Stripe confirms the subscription.
				</p>
			)}
			{checkoutState === "canceled" && (
				<p
					className="text-sm"
					style={{
						marginBottom: "20px",
						padding: "12px 14px",
						borderRadius: "8px",
						background: "var(--warn-fog)",
						color: "var(--warn)",
					}}
				>
					Checkout canceled. You can restart Pro or Agency anytime.
				</p>
			)}

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
					gap: "20px",
					maxWidth: "960px",
				}}
			>
				{tiers.map((tier) => {
					const isCurrent =
						tier.slug === "free" ? currentPlan === "free" : currentPaidSlug === tier.slug;
					const isSelected = selectedPlan === tier.slug;
					const priceConfigured =
						tier.slug === "free" ||
						(tier.slug === "pro" ? Boolean(proPriceId) : Boolean(agencyPriceId));

					return (
						<div
							key={tier.slug}
							id={`plan-${tier.slug}`}
							style={{
								border:
									isSelected || tier.featured ? "2px solid var(--ink)" : "1px solid var(--rule-2)",
								borderRadius: "10px",
								padding: "28px",
								display: "flex",
								flexDirection: "column",
								gap: "20px",
								backgroundColor: "var(--page)",
								position: "relative",
								boxShadow: isSelected ? "0 0 0 3px rgba(232,89,12,0.18)" : undefined,
							}}
						>
							{tier.featured && (
								<div
									style={{
										position: "absolute",
										top: "-12px",
										left: "50%",
										transform: "translateX(-50%)",
										backgroundColor: "var(--ink)",
										color: "var(--paper)",
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
									<span style={{ fontSize: "16px", fontWeight: 700 }}>{tier.name}</span>
									{isCurrent && (
										<span
											style={{
												fontSize: "11px",
												fontWeight: 600,
												padding: "2px 8px",
												borderRadius: "4px",
												backgroundColor: "var(--ok-fog)",
												color: "var(--ok)",
											}}
										>
											Current plan
										</span>
									)}
								</div>
								<div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
									<span style={{ fontSize: "32px", fontWeight: 800 }}>{tier.price}</span>
									<span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
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
											color: "var(--ink-2)",
											display: "flex",
											alignItems: "flex-start",
											gap: "8px",
										}}
									>
										<span style={{ color: "var(--ok)", flexShrink: 0, marginTop: "1px" }}>
											&#10003;
										</span>
										{feature}
									</li>
								))}
							</ul>

							<div>
								{isCurrent ? (
									<div
										style={{
											textAlign: "center",
											padding: "10px",
											border: "1px solid var(--rule-2)",
											borderRadius: "6px",
											fontSize: "14px",
											color: "var(--text-secondary)",
										}}
									>
										Active plan
									</div>
								) : tier.slug === "free" ? (
									<div
										style={{
											textAlign: "center",
											padding: "10px",
											border: "1px solid var(--rule-2)",
											borderRadius: "6px",
											fontSize: "14px",
											color: "var(--text-secondary)",
										}}
									>
										Free forever
									</div>
								) : priceConfigured ? (
									<CheckoutButton
										plan={tier.slug}
										label={`Upgrade to ${tier.name}`}
										signedIn={Boolean(userId)}
									/>
								) : (
									<div
										style={{
											textAlign: "center",
											padding: "10px",
											border: "1px solid var(--rule-2)",
											borderRadius: "6px",
											fontSize: "13px",
											color: "var(--text-secondary)",
										}}
									>
										Checkout is not configured yet
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
