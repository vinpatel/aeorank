import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
import { AddSiteForm } from "@/components/AddSiteForm";

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
		<div style={{ maxWidth: "800px" }}>
			<h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
				Your sites
			</h1>
			<p style={{ color: "#6b7280", marginBottom: "24px", fontSize: "15px" }}>
				Add a site URL to scan its AEO score.
			</p>

			<div style={{ marginBottom: "32px" }}>
				<AddSiteForm />
			</div>

			{sites.length === 0 ? (
				<div
					style={{
						padding: "40px",
						textAlign: "center",
						border: "1px dashed #d1d5db",
						borderRadius: "12px",
						color: "#9ca3af",
					}}
				>
					<p style={{ margin: 0, fontSize: "15px" }}>
						No sites yet. Add your first site above.
					</p>
				</div>
			) : (
				<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
					{sites.map((site) => (
						<Link
							key={site.id}
							href={`/sites/${site.id}`}
							style={{ textDecoration: "none" }}
						>
							<div
								style={{
									padding: "16px 20px",
									border: "1px solid #e5e7eb",
									borderRadius: "10px",
									background: "#fff",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									cursor: "pointer",
									transition: "border-color 0.15s",
								}}
							>
								<div>
									<div style={{ fontWeight: 600, color: "#111", fontSize: "15px" }}>
										{site.url}
									</div>
									{site.latest_scan?.scanned_at && (
										<div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "2px" }}>
											Scanned{" "}
											{new Date(site.latest_scan.scanned_at).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</div>
									)}
								</div>
								<div style={{ textAlign: "right" }}>
									{site.latest_scan?.score != null ? (
										<>
											<div
												style={{
													fontSize: "24px",
													fontWeight: 800,
													color: scoreColor(site.latest_scan.score),
													lineHeight: 1,
												}}
											>
												{site.latest_scan.score}
											</div>
											<div style={{ fontSize: "13px", color: "#9ca3af" }}>
												{site.latest_scan.grade}
											</div>
										</>
									) : (
										<div style={{ fontSize: "13px", color: "#9ca3af" }}>
											Scanning...
										</div>
									)}
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
