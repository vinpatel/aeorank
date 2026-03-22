import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import { ScanStatus } from "@/components/ScanStatus";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { ScoreChart } from "@/components/ScoreChart";
import { DownloadButton } from "@/components/DownloadButton";
import { RetryScanButton } from "@/components/RetryScanButton";
import { DimensionTrends } from "@/components/DimensionTrends";
import type { DimensionScore } from "@aeorank/core";

interface PageProps {
	params: Promise<{ siteId: string }>;
}

export default async function SiteDetailPage({ params }: PageProps) {
	// Next.js 16: params is a Promise
	const { siteId } = await params;

	const { userId } = await auth();
	if (!userId) return null; // Layout handles redirect

	const supabase = createServerSupabaseClient();

	// Fetch site and verify ownership
	const { data: site, error: siteError } = await supabase
		.from("sites")
		.select("id, url, name, created_at")
		.eq("id", siteId)
		.eq("user_id", userId)
		.single();

	if (siteError || !site) {
		notFound();
	}

	// Fetch the most recent scan
	const { data: scan } = await supabase
		.from("scans")
		.select("id, status, score, grade, dimensions, error, scanned_at, pages_scanned, duration_ms")
		.eq("site_id", siteId)
		.eq("user_id", userId)
		.order("scanned_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	// Fetch last 30 days of completed scans for score history chart
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
	const { data: historyScans } = await supabase
		.from("scans")
		.select("score, dimensions, scanned_at")
		.eq("site_id", siteId)
		.eq("user_id", userId)
		.eq("status", "complete")
		.gte("scanned_at", thirtyDaysAgo)
		.order("scanned_at", { ascending: true });

	const scoreHistory = (historyScans ?? [])
		.filter((s) => s.score != null)
		.map((s) => ({
			date: s.scanned_at as string,
			score: s.score as number,
		}));

	// Build per-dimension trend data from historical scans
	const dimensionTrendData = (historyScans ?? [])
		.filter((s) => s.dimensions != null)
		.map((s) => {
			const dims = s.dimensions as DimensionScore[];
			const point: Record<string, string | number> = { date: s.scanned_at as string };
			for (const dim of dims) {
				point[dim.id] = dim.score;
			}
			return point;
		});

	// Extract dimension metadata from latest scan for legend
	const dimensionMeta = scan?.dimensions
		? (scan.dimensions as DimensionScore[]).map((d) => ({
				id: d.id,
				name: d.name,
				weight: d.weight,
			}))
		: [];

	return (
		<div style={{ maxWidth: "860px", animation: "fadeIn 0.3s ease" }}>
			<div style={{ marginBottom: "24px" }}>
				<Link
					href="/dashboard"
					style={{
						fontSize: "13px",
						color: "var(--text-muted)",
						textDecoration: "none",
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
						fontWeight: 500,
						transition: "color 0.15s",
					}}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
						<path d="M19 12H5M12 19l-7-7 7-7"/>
					</svg>
					Back to dashboard
				</Link>
			</div>

			<h1
				style={{
					fontFamily: "var(--font-display)",
					fontSize: "24px",
					fontWeight: 700,
					marginBottom: "4px",
					wordBreak: "break-all",
					letterSpacing: "-0.02em",
				}}
			>
				{site.url}
			</h1>
			<p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "32px" }}>
				Added{" "}
				{new Date(site.created_at).toLocaleDateString("en-US", {
					month: "long",
					day: "numeric",
					year: "numeric",
				})}
			</p>

			{!scan ? (
				<div
					style={{
						padding: "48px 32px",
						textAlign: "center",
						border: "2px dashed var(--border)",
						borderRadius: "var(--radius-lg)",
						color: "var(--text-muted)",
						background: "var(--bg-card)",
					}}
				>
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: "0 auto 16px", opacity: 0.3 }}>
						<circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3"/>
						<path d="M24 16v8l6 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
					</svg>
					<p style={{ margin: 0, fontWeight: 500 }}>No scan results yet.</p>
				</div>
			) : scan.status === "pending" || scan.status === "running" ? (
				<ScanStatus scanId={scan.id} initialStatus={scan.status} />
			) : scan.status === "error" ? (
				<div
					style={{
						padding: "20px",
						background: "var(--red-bg)",
						border: "1px solid #fecaca",
						borderRadius: "var(--radius-md)",
						color: "var(--red)",
					}}
				>
					<p style={{ margin: 0, fontWeight: 600, fontSize: "15px" }}>Scan failed</p>
					{scan.error && (
						<p style={{ margin: "6px 0 0", fontSize: "14px", opacity: 0.85 }}>
							{scan.error as string}
						</p>
					)}
					<RetryScanButton url={site.url} />
				</div>
			) : scan.status === "complete" && scan.score != null && scan.dimensions ? (
				<>
					{scan.pages_scanned != null && scan.duration_ms != null && (
						<div
							style={{
								display: "flex",
								gap: "20px",
								marginBottom: "28px",
								fontSize: "13px",
								color: "var(--text-secondary)",
								background: "var(--bg-surface)",
								padding: "12px 16px",
								borderRadius: "var(--radius-sm)",
							}}
						>
							<span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 7v0M12 7v0M16 7v0"/><path d="M2 11h20"/></svg>
								{scan.pages_scanned as number} pages scanned
							</span>
							<span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
								{Math.round((scan.duration_ms as number) / 1000)}s
							</span>
							{scan.scanned_at && (
								<span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
									{new Date(scan.scanned_at as string).toLocaleString("en-US", {
										month: "short",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
							)}
						</div>
					)}
					{scoreHistory.length > 0 && (
						<div style={{
							marginBottom: "28px",
							background: "var(--bg-card)",
							border: "1px solid var(--border)",
							borderRadius: "var(--radius-md)",
							padding: "20px",
							boxShadow: "var(--shadow-card)",
						}}>
							<p
								style={{
									fontSize: "12px",
									fontWeight: 600,
									color: "var(--text-muted)",
									textTransform: "uppercase",
									letterSpacing: "0.06em",
									marginBottom: "12px",
								}}
							>
								Score History (30 days)
							</p>
							<ScoreChart data={scoreHistory} />
						</div>
					)}
					{dimensionTrendData.length >= 2 && dimensionMeta.length > 0 && (
						<div style={{
							marginBottom: "28px",
							background: "var(--bg-card)",
							border: "1px solid var(--border)",
							borderRadius: "var(--radius-md)",
							padding: "20px",
							boxShadow: "var(--shadow-card)",
						}}>
							<p
								style={{
									fontSize: "12px",
									fontWeight: 600,
									color: "var(--text-muted)",
									textTransform: "uppercase",
									letterSpacing: "0.06em",
									marginBottom: "12px",
								}}
							>
								Dimension Trends (30 days)
							</p>
							<DimensionTrends data={dimensionTrendData} dimensions={dimensionMeta} />
						</div>
					)}
					<div style={{ marginBottom: "28px" }}>
						<DownloadButton siteId={siteId} />
					</div>
					<ScoreBreakdown
						score={scan.score as number}
						grade={scan.grade as string}
						dimensions={scan.dimensions as DimensionScore[]}
					/>
				</>
			) : (
				<div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
					Unexpected scan state: {scan.status}
				</div>
			)}
		</div>
	);
}
