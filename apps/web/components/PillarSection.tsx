"use client";

import { useState } from "react";
import type { DimensionScore } from "@aeorank/core";

interface PillarSectionProps {
	name: string;
	pillarScore: number;
	dimensions: DimensionScore[];
}

function scoreColorClass(score: number): string {
	if (score >= 70) return "text-green";
	if (score >= 40) return "text-amber";
	return "text-red";
}

function statusDotClass(status: "pass" | "warn" | "fail"): string {
	if (status === "pass") return "status-dot status-dot-green";
	if (status === "warn") return "status-dot status-dot-amber";
	return "status-dot status-dot-red";
}

function statusTextClass(status: "pass" | "warn" | "fail"): string {
	if (status === "pass") return "font-medium text-xs text-green";
	if (status === "warn") return "font-medium text-xs text-amber";
	return "font-medium text-xs text-red";
}

function weightBadgeClass(weightPct: number): string {
	if (weightPct >= 5) return "badge badge-red";
	if (weightPct >= 3) return "badge badge-amber";
	return "badge badge-green";
}

export function PillarSection({ name, pillarScore, dimensions }: PillarSectionProps) {
	const [isExpanded, setIsExpanded] = useState(true);

	return (
		<div className="mb-3">
			{/* Pillar header */}
			<button
				type="button"
				className="card p-4 w-full cursor-pointer flex items-center justify-between"
				onClick={() => setIsExpanded((prev) => !prev)}
				aria-expanded={isExpanded}
			>
				<span className="font-semibold text-base">{name}</span>
				<span className="flex items-center gap-3">
					<span className={`font-semibold tabular-nums ${scoreColorClass(pillarScore)}`}>
						{pillarScore}
					</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						style={{
							transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
							transition: "transform 0.2s ease",
						}}
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</span>
			</button>

			{/* Pillar dimension table */}
			{isExpanded && dimensions.length > 0 && (
				<div className="table-wrap mt-1">
					<table className="table">
						<thead>
							<tr>
								<th className="col-dimension">Dimension</th>
								<th className="text-center col-score">Score</th>
								<th className="text-center col-weight">Weight</th>
								<th className="text-center col-status">Status</th>
								<th>Hint</th>
							</tr>
						</thead>
						<tbody>
							{dimensions.map((dim) => (
								<tr key={dim.id}>
									<td className="font-medium">{dim.name}</td>
									<td
										className={`text-center tabular-nums font-semibold ${scoreColorClass(Math.round((dim.score / dim.maxScore) * 100))}`}
									>
										{dim.score}/{dim.maxScore}
									</td>
									<td className="text-center">
										<span className={weightBadgeClass(dim.weightPct)}>
											{dim.weightPct}%
										</span>
									</td>
									<td className="text-center">
										<span className="flex items-center justify-center gap-3">
											<span className={statusDotClass(dim.status)} />
											<span className={statusTextClass(dim.status)}>
												{dim.status.charAt(0).toUpperCase() + dim.status.slice(1)}
											</span>
										</span>
									</td>
									<td className="text-xs text-secondary">{dim.hint}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
