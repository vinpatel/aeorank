import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
import { AddSiteForm } from "@/components/AddSiteForm";
import { DeleteSiteButton } from "@/components/DeleteSiteButton";

interface LatestScan {
	score: number | null;
	grade: string | null;
	scanned_at: string | null;
}

interface SiteWithScan {
	id: string;
	url: string;
	name: string | null;
	created_at: string;
	latest_scan: LatestScan | null;
}

export default async function DashboardPage() {
	const { userId } = await auth();
	if (!userId) return null; // Layout handles redirect

	const supabase = createServerSupabaseClient();

	// Fetch user's sites with the most recent scan for each
	let sites: SiteWithScan[] = [];
	try {
		const { data, error } = await supabase
			.from("sites")
			.select(
				`
				id,
				url,
				name,
				created_at,
				scans(score, grade, scanned_at, status)
			`,
			)
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (!error && data) {
			sites = data.map((site) => {
				// Pick the most recent completed scan
				const scansArr = Array.isArray(site.scans) ? site.scans : [site.scans].filter(Boolean);
				const completedScans = scansArr
					.filter((s): s is typeof s & { status: string; scanned_at: string } =>
						s !== null && (s as Record<string, unknown>).status === "complete",
					)
					.sort((a, b) => {
						const aTime = (a as Record<string, unknown>).scanned_at as string ?? "";
						const bTime = (b as Record<string, unknown>).scanned_at as string ?? "";
						return bTime.localeCompare(aTime);
					});

				const latest = completedScans[0] as
					| { score: number | null; grade: string | null; scanned_at: string | null }
					| undefined;

				return {
					id: site.id,
					url: site.url,
					name: site.name,
					created_at: site.created_at,
					latest_scan: latest
						? {
								score: (latest as Record<string, unknown>).score as number | null,
								grade: (latest as Record<string, unknown>).grade as string | null,
								scanned_at: (latest as Record<string, unknown>).scanned_at as string | null,
							}
						: null,
				};
			});
		}
	} catch {
		// Supabase not yet configured — render empty state
	}

	function scoreColor(score: number): string {
		if (score >= 70) return "var(--green)";
		if (score >= 40) return "var(--amber)";
		return "var(--red)";
	}

	return (
		<div className="page-container animate-fade-in">
			<div className="rail" style={{ paddingTop: "4px", paddingBottom: "28px", marginBottom: "24px", borderBottom: "1px solid var(--rule)" }}>
				<span className="rail-tick" style={{ top: 0 }}></span>
				<span className="rail-coord" style={{ top: 0 }}>000</span>
				<div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
					<div>
						<p className="t-label">// your dashboard</p>
						<h1 className="heading-xl mt-2 mb-1">Your sites</h1>
						<p className="text-sm text-secondary">Add a site URL and we'll score it against 36 AEO criteria.</p>
					</div>
					<div className="section-meta">
						<span>{sites.length}&nbsp;<b>sites</b></span>
						<span>36&nbsp;<b>criteria</b></span>
						<span>9&nbsp;<b>files</b></span>
					</div>
				</div>
			</div>

			<div style={{ marginBottom: "32px" }}>
				<AddSiteForm />
			</div>

			{sites.length === 0 ? (
				<div className="empty-state">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="empty-state-icon">
						<rect x="4" y="4" width="40" height="40" rx="12" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3"/>
						<path d="M24 16v16m-8-8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
					</svg>
					<p className="text-sm font-medium">No sites yet. Add your first site above.</p>
				</div>
			) : (
				<div className="flex flex-col gap-6 stagger">
					{sites.map((site) => (
						<Link
							key={site.id}
							href={`/sites/${site.id}`}
							style={{ textDecoration: "none" }}
						>
							<div className="site-card animate-fade-in-up">
								<div className="flex items-center gap-10">
									<div className="site-icon">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<circle cx="12" cy="12" r="10"/>
											<path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
										</svg>
									</div>
									<div>
										<div className="font-semibold text-sm" style={{ color: "var(--text)" }}>
											{site.url}
										</div>
										{site.latest_scan?.scanned_at && (
											<div className="text-xs text-muted" style={{ marginTop: "2px" }}>
												Scanned{" "}
												{new Date(site.latest_scan.scanned_at).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</div>
										)}
									</div>
								</div>
								<div className="flex items-center gap-8">
									{site.latest_scan?.score != null ? (
										<>
											<div className="text-right">
												<div className="score-md animate-count-up" style={{ color: scoreColor(site.latest_scan.score) }}>
													{site.latest_scan.score}
												</div>
												<div className="text-xs text-muted" style={{ marginTop: "2px" }}>/100</div>
											</div>
											<div
												className="grade-badge animate-grade-bounce"
												style={{ background: scoreColor(site.latest_scan.score) }}
											>
												{site.latest_scan.grade}
											</div>
										</>
									) : (
										<div className="flex items-center gap-3 text-xs text-muted">
											<div className="spinner spinner-sm" />
											Scanning...
										</div>
									)}
									<DeleteSiteButton siteId={site.id} siteUrl={site.url} />
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
