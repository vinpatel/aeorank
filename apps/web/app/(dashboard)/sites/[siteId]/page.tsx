import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import { ScanStatus } from "@/components/ScanStatus";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
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

	return (
		<div style={{ maxWidth: "800px" }}>
			<div style={{ marginBottom: "24px" }}>
				<Link
					href="/dashboard"
					style={{
						fontSize: "14px",
						color: "#6b7280",
						textDecoration: "none",
						display: "inline-flex",
						alignItems: "center",
						gap: "4px",
					}}
				>
					&larr; Back to dashboard
				</Link>
			</div>

			<h1
				style={{
					fontSize: "22px",
					fontWeight: 700,
					marginBottom: "4px",
					wordBreak: "break-all",
				}}
			>
				{site.url}
			</h1>
			<p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "32px" }}>
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
						padding: "32px",
						textAlign: "center",
						border: "1px dashed #d1d5db",
						borderRadius: "12px",
						color: "#9ca3af",
					}}
				>
					<p style={{ margin: 0 }}>No scan results yet.</p>
				</div>
			) : scan.status === "pending" || scan.status === "running" ? (
				<ScanStatus scanId={scan.id} initialStatus={scan.status} />
			) : scan.status === "error" ? (
				<div
					style={{
						padding: "16px",
						background: "#fef2f2",
						border: "1px solid #fecaca",
						borderRadius: "8px",
						color: "#dc2626",
					}}
				>
					<p style={{ margin: 0, fontWeight: 600 }}>Scan failed</p>
					{scan.error && (
						<p style={{ margin: "4px 0 0", fontSize: "14px" }}>
							{scan.error as string}
						</p>
					)}
				</div>
			) : scan.status === "complete" && scan.score != null && scan.dimensions ? (
				<>
					{scan.pages_scanned != null && scan.duration_ms != null && (
						<div
							style={{
								display: "flex",
								gap: "24px",
								marginBottom: "24px",
								fontSize: "13px",
								color: "#6b7280",
							}}
						>
							<span>{scan.pages_scanned as number} pages scanned</span>
							<span>{Math.round((scan.duration_ms as number) / 1000)}s</span>
							{scan.scanned_at && (
								<span>
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
					<ScoreBreakdown
						score={scan.score as number}
						grade={scan.grade as string}
						dimensions={scan.dimensions as DimensionScore[]}
					/>
				</>
			) : (
				<div style={{ color: "#6b7280", fontSize: "14px" }}>
					Unexpected scan state: {scan.status}
				</div>
			)}
		</div>
	);
}
