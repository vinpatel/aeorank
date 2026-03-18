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
		if (score >= 70) return "#16a34a";
		if (score >= 40) return "#d97706";
		return "#dc2626";
	}

	return (
		<div style={{ maxWidth: "860px", animation: "fadeIn 0.3s ease" }}>
			<div style={{ marginBottom: "8px" }}>
				<h1 style={{
					fontFamily: "var(--font-display)",
					fontSize: "28px",
					fontWeight: 700,
					letterSpacing: "-0.02em",
					marginBottom: "6px",
				}}>
					Your sites
				</h1>
				<p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
					Add a site URL to scan its AEO score.
				</p>
			</div>

			<div style={{ margin: "24px 0 36px" }}>
				<AddSiteForm />
			</div>

			{sites.length === 0 ? (
				<div
					style={{
						padding: "60px 40px",
						textAlign: "center",
						border: "2px dashed var(--border)",
						borderRadius: "var(--radius-lg)",
						color: "var(--text-muted)",
						background: "var(--bg-card)",
					}}
				>
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: "0 auto 16px", opacity: 0.4 }}>
						<rect x="4" y="4" width="40" height="40" rx="12" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3"/>
						<path d="M24 16v16m-8-8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
					</svg>
					<p style={{ margin: 0, fontSize: "15px", fontWeight: 500 }}>
						No sites yet. Add your first site above.
					</p>
				</div>
			) : (
				<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
					{sites.map((site) => (
						<Link
							key={site.id}
							href={`/sites/${site.id}`}
							style={{ textDecoration: "none" }}
						>
							<div
								className="site-card"
								style={{
									padding: "18px 22px",
									border: "1px solid var(--border)",
									borderRadius: "var(--radius-md)",
									background: "var(--bg-card)",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									cursor: "pointer",
									boxShadow: "var(--shadow-card)",
								}}
							>
								<div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
									<div style={{
										width: "40px",
										height: "40px",
										borderRadius: "var(--radius-sm)",
										background: "var(--bg-accent-light)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										flexShrink: 0,
									}}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<circle cx="12" cy="12" r="10"/>
											<path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
										</svg>
									</div>
									<div>
										<div style={{ fontWeight: 600, color: "var(--text)", fontSize: "15px" }}>
											{site.url}
										</div>
										{site.latest_scan?.scanned_at && (
											<div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
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
								<div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "12px" }}>
									{site.latest_scan?.score != null ? (
										<>
											<div>
												<div
													style={{
														fontFamily: "var(--font-display)",
														fontSize: "28px",
														fontWeight: 700,
														color: scoreColor(site.latest_scan.score),
														lineHeight: 1,
														letterSpacing: "-0.02em",
													}}
												>
													{site.latest_scan.score}
												</div>
												<div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
													/100
												</div>
											</div>
											<div style={{
												width: "36px",
												height: "36px",
												borderRadius: "var(--radius-sm)",
												background: scoreColor(site.latest_scan.score),
												color: "white",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontFamily: "var(--font-display)",
												fontWeight: 700,
												fontSize: "16px",
											}}>
												{site.latest_scan.grade}
											</div>
										</>
									) : (
										<div style={{
											fontSize: "13px",
											color: "var(--text-muted)",
											display: "flex",
											alignItems: "center",
											gap: "6px",
										}}>
											<div style={{
												width: "14px",
												height: "14px",
												border: "2px solid var(--border)",
												borderTopColor: "var(--text-accent)",
												borderRadius: "50%",
												animation: "spin 0.8s linear infinite",
											}} />
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
