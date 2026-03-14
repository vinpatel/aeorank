import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
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

	// Fetch current subscription to show plan badge in nav
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
		<div style={{ display: "flex", minHeight: "100vh" }}>
			<nav
				style={{
					width: "200px",
					borderRight: "1px solid #e5e7eb",
					padding: "24px 16px",
					display: "flex",
					flexDirection: "column",
					gap: "8px",
				}}
			>
				<div style={{ marginBottom: "16px" }}>
					<span style={{ fontWeight: 700, fontSize: "16px" }}>AEOrank</span>
				</div>
				<Link
					href="/dashboard"
					style={{ padding: "8px", textDecoration: "none", color: "#111" }}
				>
					Dashboard
				</Link>
				<Link
					href="/upgrade"
					style={{ padding: "8px", textDecoration: "none", color: "#111" }}
				>
					Upgrade
				</Link>
				<div style={{ marginTop: "auto", paddingTop: "16px" }}>
					<PlanBadge plan={currentPlan} />
				</div>
			</nav>
			<main style={{ flex: 1, padding: "24px" }}>{children}</main>
		</div>
	);
}
