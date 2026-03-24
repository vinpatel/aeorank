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
import { PageScores } from "@/components/PageScores";
import { RescanSchedule } from "@/components/RescanSchedule";
import { ScanComparison } from "@/components/ScanComparison";
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
		.select("id, url, name, rescan_schedule, created_at")
		.eq("id", siteId)
		.eq("user_id", userId)
		.single();

	if (siteError || !site) {
		notFound();
	}

	// Fetch the most recent scan (including page_scores)
	// First check for any pending/running scan — user needs to see scan progress
	const { data: activeScan } = await supabase
		.from("scans")
		.select("id, status, score, grade, dimensions, page_scores, error, scanned_at, pages_scanned, duration_ms")
		.eq("site_id", siteId)
		.eq("user_id", userId)
		.in("status", ["pending", "running"])
		.order("scanned_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	const { data: latestCompletedScan } = await supabase
		.from("scans")
		.select("id, status, score, grade, dimensions, page_scores, error, scanned_at, pages_scanned, duration_ms")
		.eq("site_id", siteId)
		.eq("user_id", userId)
		.in("status", ["complete", "error"])
		.order("scanned_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	// Prefer showing active scan (pending/running) over completed — user needs to see progress
	const scan = activeScan ?? latestCompletedScan;

	// Fetch last 30 days of completed scans for history + comparison
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
	const { data: historyScans } = await supabase
		.from("scans")
		.select("id, score, grade, dimensions, scanned_at")
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

	// Build comparison data from all historical scans
	const comparisonScans = (historyScans ?? [])
		.filter((s) => s.dimensions != null && s.score != null)
		.map((s) => ({
			id: s.id as string,
			score: s.score as number,
			grade: s.grade as string,
			scanned_at: s.scanned_at as string,
			dimensions: s.dimensions as DimensionScore[],
		}));

	// Page scores from latest scan
	const pageScores = (scan?.page_scores as { url: string; title: string; score: number; grade: string; dimensions: { id: string; score: number; status: "pass" | "warn" | "fail" }[] }[] | null) ?? [];

	return (
		<div className="page-container animate-fade-in">
			<div className="mb-8">
				<Link href="/dashboard" className="back-link">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
						<path d="M19 12H5M12 19l-7-7 7-7"/>
					</svg>
					Back to dashboard
				</Link>
			</div>

			<div className="flex justify-between items-start flex-wrap gap-8 mb-12">
				<div>
					<h1 className="heading-lg mb-1 break-all">{site.url}</h1>
					<p className="text-xs text-muted">
						Added{" "}
						{new Date(site.created_at).toLocaleDateString("en-US", {
							month: "long",
							day: "numeric",
							year: "numeric",
						})}
					</p>
				</div>
				<RescanSchedule siteId={siteId} currentSchedule={site.rescan_schedule as string | null} />
			</div>

			{!scan ? (
				<div className="empty-state empty-state-compact">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="empty-state-icon">
						<circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3"/>
						<path d="M24 16v8l6 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
					</svg>
					<p className="font-medium">No scan results yet.</p>
				</div>
			) : scan.status === "pending" || scan.status === "running" ? (
				<ScanStatus scanId={scan.id} initialStatus={scan.status} />
			) : scan.status === "error" ? (
				<div className="alert alert-error">
					<p className="font-semibold text-sm">Scan failed</p>
					{scan.error && (
						<p className="text-sm" style={{ marginTop: "6px", opacity: 0.85 }}>
							{scan.error as string}
						</p>
					)}
					<RetryScanButton url={site.url} />
				</div>
			) : scan.status === "complete" && scan.score != null && scan.dimensions ? (
				<>
					{scan.pages_scanned != null && scan.duration_ms != null && (
						<div className="scan-meta mb-10">
							<span className="scan-meta-item">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 7v0M12 7v0M16 7v0"/><path d="M2 11h20"/></svg>
								{scan.pages_scanned as number} pages scanned
							</span>
							<span className="scan-meta-item">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
								{Math.round((scan.duration_ms as number) / 1000)}s
							</span>
							{scan.scanned_at && (
								<span className="scan-meta-item">
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
						<div className="card mb-10">
							<p className="section-label">Score History (30 days)</p>
							<ScoreChart data={scoreHistory} />
						</div>
					)}
					{dimensionTrendData.length >= 2 && dimensionMeta.length > 0 && (
						<div className="card mb-10">
							<p className="section-label">Dimension Trends (30 days)</p>
							<DimensionTrends data={dimensionTrendData} dimensions={dimensionMeta} />
						</div>
					)}
					<div className="flex gap-6 mb-10 flex-wrap">
						<DownloadButton siteId={siteId} />
						<a
							href={`/api/report/${siteId}`}
							target="_blank"
							rel="noopener noreferrer"
							className="btn btn-secondary"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
							Export report
						</a>
					</div>
					<ScoreBreakdown
						score={scan.score as number}
						grade={scan.grade as string}
						dimensions={scan.dimensions as DimensionScore[]}
					/>
					{pageScores.length > 0 && (
						<div className="card mt-10">
							<PageScores pages={pageScores} />
						</div>
					)}
					{comparisonScans.length >= 2 && (
						<div className="card mt-10">
							<p className="section-label">Compare Scans</p>
							<ScanComparison scans={comparisonScans} />
						</div>
					)}
				</>
			) : (
				<p className="text-sm text-secondary">
					Unexpected scan state: {scan.status}
				</p>
			)}
		</div>
	);
}
