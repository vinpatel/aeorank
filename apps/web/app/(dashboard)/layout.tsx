import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
import { SignOutButton } from "@clerk/nextjs";
import { PlanBadge } from "@/components/PlanBadge";
import type { PlanKey } from "@/lib/stripe";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { userId } = await auth();
	if (!userId) {
		redirect("/sign-in");
	}

	let currentPlan: PlanKey = "free";
	try {
		const supabase = createServerSupabaseClient();
		const { data } = await supabase
			.from("subscriptions")
			.select("plan")
			.eq("user_id", userId)
			.eq("status", "active")
			.maybeSingle();

		if (data?.plan && ["free", "pro", "api"].includes(data.plan)) {
			currentPlan = data.plan as PlanKey;
		}
	} catch {
		// Supabase not yet configured — default to "free" silently
	}

	return (
		<div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
			{/* Mobile header */}
			<div
				className="mobile-header"
				style={{
					display: "none",
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					height: "56px",
					background: "var(--bg-sidebar)",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "0 16px",
					zIndex: 50,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
					<svg width="24" height="24" viewBox="0 0 32 32" fill="none">
						<rect width="32" height="32" rx="7" fill="#E8590C"/>
						<path d="M8 22L13.5 10H18.5L24 22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
						<path d="M10.5 18H21.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
					</svg>
					<span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", color: "var(--text-inverse)" }}>
						AEOrank
					</span>
				</div>
				<div style={{ display: "flex", gap: "4px" }}>
					<Link href="/dashboard" style={{ padding: "6px 12px", fontSize: "13px", color: "var(--text-inverse)", textDecoration: "none", opacity: 0.8 }}>
						Dashboard
					</Link>
					<Link href="/upgrade" style={{ padding: "6px 12px", fontSize: "13px", color: "var(--text-inverse)", textDecoration: "none", opacity: 0.8 }}>
						Upgrade
					</Link>
				</div>
			</div>

			{/* Desktop sidebar */}
			<nav
				className="sidebar-desktop"
				style={{
					width: "240px",
					background: "var(--bg-sidebar)",
					padding: "24px 16px",
					display: "flex",
					flexDirection: "column",
					position: "fixed",
					top: 0,
					bottom: 0,
					left: 0,
					zIndex: 40,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px", padding: "0 8px" }}>
					<svg width="28" height="28" viewBox="0 0 32 32" fill="none">
						<rect width="32" height="32" rx="7" fill="#E8590C"/>
						<path d="M8 22L13.5 10H18.5L24 22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
						<path d="M10.5 18H21.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
					</svg>
					<span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px", color: "var(--text-inverse)", letterSpacing: "-0.02em" }}>
						AEOrank
					</span>
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
					<Link
						href="/dashboard"
						style={{
							display: "flex",
							alignItems: "center",
							gap: "10px",
							padding: "10px 12px",
							textDecoration: "none",
							color: "rgba(255,255,255,0.7)",
							fontSize: "14px",
							fontWeight: 500,
							borderRadius: "var(--radius-sm)",
							transition: "all 0.15s ease",
						}}
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
							<rect x="3" y="3" width="7" height="7" rx="1.5"/>
							<rect x="14" y="3" width="7" height="7" rx="1.5"/>
							<rect x="3" y="14" width="7" height="7" rx="1.5"/>
							<rect x="14" y="14" width="7" height="7" rx="1.5"/>
						</svg>
						Dashboard
					</Link>
					<Link
						href="/upgrade"
						style={{
							display: "flex",
							alignItems: "center",
							gap: "10px",
							padding: "10px 12px",
							textDecoration: "none",
							color: "rgba(255,255,255,0.7)",
							fontSize: "14px",
							fontWeight: 500,
							borderRadius: "var(--radius-sm)",
							transition: "all 0.15s ease",
						}}
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
							<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
						</svg>
						Upgrade
					</Link>
				</div>

				<div style={{ marginTop: "auto", padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "12px" }}>
					<PlanBadge plan={currentPlan} />
					<SignOutButton>
						<button
							type="button"
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								padding: "8px 12px",
								background: "transparent",
								border: "none",
								color: "rgba(255,255,255,0.5)",
								fontSize: "13px",
								fontWeight: 500,
								fontFamily: "inherit",
								cursor: "pointer",
								borderRadius: "var(--radius-sm)",
								transition: "color 0.15s ease",
								width: "100%",
							}}
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
								<polyline points="16 17 21 12 16 7" />
								<line x1="21" y1="12" x2="9" y2="12" />
							</svg>
							Sign out
						</button>
					</SignOutButton>
				</div>
			</nav>

			<main
				className="main-content"
				style={{
					flex: 1,
					marginLeft: "240px",
					padding: "32px 40px",
					minHeight: "100vh",
				}}
			>
				{children}
			</main>
		</div>
	);
}
