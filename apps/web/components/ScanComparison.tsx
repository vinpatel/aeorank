"use client";

import { useState } from "react";

interface DimScore {
	id: string;
	name: string;
	score: number;
	maxScore: number;
	weight: "high" | "medium" | "low";
	status: "pass" | "warn" | "fail";
}

interface ScanOption {
	id: string;
	score: number;
	grade: string;
	scanned_at: string;
	dimensions: DimScore[];
}

interface ScanComparisonProps {
	scans: ScanOption[];
}

function scoreColor(score: number): string {
	if (score >= 70) return "var(--green)";
	if (score >= 40) return "var(--amber)";
	return "var(--red)";
}

function formatDate(d: string): string {
	return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function ScanComparison({ scans }: ScanComparisonProps) {
	const [leftIdx, setLeftIdx] = useState(scans.length >= 2 ? scans.length - 2 : 0);
	const [rightIdx, setRightIdx] = useState(scans.length - 1);

	if (scans.length < 2) return null;

	const left = scans[leftIdx];
	const right = scans[rightIdx];

	// Build dimension map for both scans
	const leftDims = new Map(left.dimensions.map((d) => [d.id, d]));
	const rightDims = new Map(right.dimensions.map((d) => [d.id, d]));
	const allDimIds = [...new Set([...leftDims.keys(), ...rightDims.keys()])];

	const overallDelta = right.score - left.score;

	return (
		<div>
			{/* Scan pickers */}
			<div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "center", flexWrap: "wrap" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
					<span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>From:</span>
					<select
						value={leftIdx}
						onChange={(e) => setLeftIdx(Number(e.target.value))}
						style={{
							padding: "4px 8px",
							fontSize: "12px",
							borderRadius: "6px",
							border: "1px solid var(--border)",
							background: "var(--bg-surface)",
							color: "var(--text)",
							fontFamily: "inherit",
						}}
					>
						{scans.map((s, i) => (
							<option key={s.id} value={i}>
								{formatDate(s.scanned_at)} — {s.score}/100
							</option>
						))}
					</select>
				</div>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
					<span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>To:</span>
					<select
						value={rightIdx}
						onChange={(e) => setRightIdx(Number(e.target.value))}
						style={{
							padding: "4px 8px",
							fontSize: "12px",
							borderRadius: "6px",
							border: "1px solid var(--border)",
							background: "var(--bg-surface)",
							color: "var(--text)",
							fontFamily: "inherit",
						}}
					>
						{scans.map((s, i) => (
							<option key={s.id} value={i}>
								{formatDate(s.scanned_at)} — {s.score}/100
							</option>
						))}
					</select>
				</div>
				{overallDelta !== 0 && (
					<span style={{
						fontSize: "14px",
						fontWeight: 700,
						color: overallDelta > 0 ? "var(--green)" : "var(--red)",
					}}>
						{overallDelta > 0 ? "+" : ""}{overallDelta} pts
					</span>
				)}
			</div>

			{/* Comparison table */}
			<div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
				<table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
					<thead>
						<tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
							<th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Dimension</th>
							<th style={{ textAlign: "center", padding: "8px 12px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", width: "80px" }}>Before</th>
							<th style={{ textAlign: "center", padding: "8px 12px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", width: "80px" }}>After</th>
							<th style={{ textAlign: "center", padding: "8px 12px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", width: "70px" }}>Change</th>
						</tr>
					</thead>
					<tbody>
						{/* Overall row */}
						<tr style={{ borderBottom: "2px solid var(--border)", background: "var(--bg-surface)" }}>
							<td style={{ padding: "10px 12px", fontWeight: 700 }}>Overall Score</td>
							<td style={{ textAlign: "center", fontWeight: 700, color: scoreColor(left.score) }}>{left.score}</td>
							<td style={{ textAlign: "center", fontWeight: 700, color: scoreColor(right.score) }}>{right.score}</td>
							<td style={{ textAlign: "center", fontWeight: 700, color: overallDelta > 0 ? "var(--green)" : overallDelta < 0 ? "var(--red)" : "var(--text-muted)" }}>
								{overallDelta > 0 ? "+" : ""}{overallDelta}
							</td>
						</tr>
						{allDimIds.map((dimId, i) => {
							const l = leftDims.get(dimId);
							const r = rightDims.get(dimId);
							const delta = (r?.score ?? 0) - (l?.score ?? 0);
							return (
								<tr key={dimId} style={{ borderBottom: i < allDimIds.length - 1 ? "1px solid var(--border-light)" : "none", background: "var(--bg-card)" }}>
									<td style={{ padding: "10px 12px", fontWeight: 500 }}>{r?.name ?? l?.name ?? dimId}</td>
									<td style={{ textAlign: "center", fontVariantNumeric: "tabular-nums", color: scoreColor(((l?.score ?? 0) / (l?.maxScore ?? 10)) * 100) }}>
										{l ? `${l.score}/${l.maxScore}` : "—"}
									</td>
									<td style={{ textAlign: "center", fontVariantNumeric: "tabular-nums", color: scoreColor(((r?.score ?? 0) / (r?.maxScore ?? 10)) * 100) }}>
										{r ? `${r.score}/${r.maxScore}` : "—"}
									</td>
									<td style={{ textAlign: "center", fontWeight: 600, color: delta > 0 ? "var(--green)" : delta < 0 ? "var(--red)" : "var(--text-muted)" }}>
										{delta > 0 ? "+" : ""}{delta}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
