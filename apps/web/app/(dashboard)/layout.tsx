import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { PlanBadge } from "@/components/PlanBadge";
import { getCurrentPlan } from "@/lib/plan";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { userId } = await auth();
	if (!userId) {
		redirect("/sign-in");
	}

	const currentPlan = await getCurrentPlan();

	return (
		<div className="flex" style={{ minHeight: "100vh", background: "var(--bg)" }}>
			{/* Mobile header */}
			<div className="mobile-header">
				<div className="mobile-header-logo">
					<svg width="24" height="24" viewBox="0 0 32 32" fill="none">
						<rect width="32" height="32" rx="7" fill="#111111"/>
						<path d="M8 22L13.5 10H18.5L24 22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
						<path d="M10.5 18H21.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
					</svg>
					<span className="mobile-header-logo-text">AEOrank</span>
					<span className="brand-ver">app</span>
				</div>
				<div className="mobile-header-nav">
					<Link href="/dashboard" className="mobile-nav-link">Dashboard</Link>
					<Link href="/upgrade" className="mobile-nav-link">Upgrade</Link>
				</div>
			</div>

			{/* Desktop sidebar */}
			<nav className="sidebar sidebar-desktop">
				<div className="sidebar-logo">
					<svg width="28" height="28" viewBox="0 0 32 32" fill="none">
						<rect width="32" height="32" rx="7" fill="#111111"/>
						<path d="M8 22L13.5 10H18.5L24 22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
						<path d="M10.5 18H21.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
					</svg>
					<span className="sidebar-logo-text">AEOrank</span>
					<span className="brand-ver">app</span>
				</div>

				<div className="sidebar-nav">
					<Link href="/dashboard" className="sidebar-link sidebar-link-active">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
							<rect x="3" y="3" width="7" height="7" rx="1.5"/>
							<rect x="14" y="3" width="7" height="7" rx="1.5"/>
							<rect x="3" y="14" width="7" height="7" rx="1.5"/>
							<rect x="14" y="14" width="7" height="7" rx="1.5"/>
						</svg>
						Dashboard
					</Link>
					<Link href="/upgrade" className="sidebar-link">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
							<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
						</svg>
						Upgrade
					</Link>
				</div>

				<div className="sidebar-footer">
					<PlanBadge plan={currentPlan} />
					<SignOutButton redirectUrl="https://aeorank.dev">
						<button type="button" className="sidebar-signout">
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

			<main className="main-content">
				{children}
			</main>
		</div>
	);
}
