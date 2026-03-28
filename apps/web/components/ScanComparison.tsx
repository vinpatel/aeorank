"use client";

import { useState } from "react";

interface DimScore {
	id: string;
	name: string;
	score: number;
	maxScore: number;
	weightPct: number;
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

function scoreColorClass(score: number): string {
	if (score >= 70) return "score-green";
	if (score >= 40) return "score-amber";
	return "score-red";
}

function deltaColorClass(delta: number): string {
	if (delta > 0) return "delta-positive";
	if (delta < 0) return "delta-negative";
	return "delta-neutral";
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
			<div className="flex gap-8 items-center flex-wrap mb-6">
				<div className="flex items-center gap-3">
					<span className="text-xs font-semibold text-muted">From:</span>
					<select
						value={leftIdx}
						onChange={(e) => setLeftIdx(Number(e.target.value))}
						className="select"
					>
						{scans.map((s, i) => (
							<option key={s.id} value={i}>
								{formatDate(s.scanned_at)} — {s.score}/100
							</option>
						))}
					</select>
				</div>
				<svg className="icon-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				<div className="flex items-center gap-3">
					<span className="text-xs font-semibold text-muted">To:</span>
					<select
						value={rightIdx}
						onChange={(e) => setRightIdx(Number(e.target.value))}
						className="select"
					>
						{scans.map((s, i) => (
							<option key={s.id} value={i}>
								{formatDate(s.scanned_at)} — {s.score}/100
							</option>
						))}
					</select>
				</div>
				{overallDelta !== 0 && (
					<span className={`text-sm font-bold ${deltaColorClass(overallDelta)}`}>
						{overallDelta > 0 ? "+" : ""}{overallDelta} pts
					</span>
				)}
			</div>

			{/* Comparison table */}
			<div className="table-wrap">
				<table className="table table-sm">
					<thead>
						<tr>
							<th>Dimension</th>
							<th className="text-center col-before">Before</th>
							<th className="text-center col-after">After</th>
							<th className="text-center col-change">Change</th>
						</tr>
					</thead>
					<tbody>
						{/* Overall row */}
						<tr className="row-overall">
							<td className="font-bold cell-padded">Overall Score</td>
							<td className={`text-center font-bold ${scoreColorClass(left.score)}`}>{left.score}</td>
							<td className={`text-center font-bold ${scoreColorClass(right.score)}`}>{right.score}</td>
							<td className={`text-center font-bold ${deltaColorClass(overallDelta)}`}>
								{overallDelta > 0 ? "+" : ""}{overallDelta}
							</td>
						</tr>
						{allDimIds.map((dimId) => {
							const l = leftDims.get(dimId);
							const r = rightDims.get(dimId);
							const delta = (r?.score ?? 0) - (l?.score ?? 0);
							return (
								<tr key={dimId}>
									<td className="font-medium cell-padded">{r?.name ?? l?.name ?? dimId}</td>
									<td className={`text-center tabular-nums ${scoreColorClass(((l?.score ?? 0) / (l?.maxScore ?? 10)) * 100)}`}>
										{l ? `${l.score}/${l.maxScore}` : "\u2014"}
									</td>
									<td className={`text-center tabular-nums ${scoreColorClass(((r?.score ?? 0) / (r?.maxScore ?? 10)) * 100)}`}>
										{r ? `${r.score}/${r.maxScore}` : "\u2014"}
									</td>
									<td className={`text-center font-semibold ${deltaColorClass(delta)}`}>
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
