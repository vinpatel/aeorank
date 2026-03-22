"use client";

import { useState } from "react";

interface PageScoreDim {
	id: string;
	score: number;
	status: "pass" | "warn" | "fail";
}

interface PageScoreData {
	url: string;
	title: string;
	score: number;
	grade: string;
	dimensions: PageScoreDim[];
}

interface PageScoresProps {
	pages: PageScoreData[];
}

function scoreColor(score: number): string {
	if (score >= 70) return "var(--green)";
	if (score >= 40) return "var(--amber)";
	return "var(--red)";
}

export function PageScores({ pages }: PageScoresProps) {
	const [expanded, setExpanded] = useState(false);
	const [sortBy, setSortBy] = useState<"score" | "url">("score");

	if (pages.length === 0) return null;

	const sorted = [...pages].sort((a, b) =>
		sortBy === "score" ? a.score - b.score : a.url.localeCompare(b.url),
	);

	const displayed = expanded ? sorted : sorted.slice(0, 10);

	return (
		<div>
			<div style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				marginBottom: "12px",
			}}>
				<p style={{
					fontSize: "12px",
					fontWeight: 600,
					color: "var(--text-muted)",
					textTransform: "uppercase",
					letterSpacing: "0.06em",
					margin: 0,
				}}>
					Per-Page Scores ({pages.length} pages)
				</p>
				<div style={{ display: "flex", gap: "4px" }}>
					{(["score", "url"] as const).map((key) => (
						<button
							key={key}
							type="button"
							onClick={() => setSortBy(key)}
							style={{
								padding: "3px 8px",
								fontSize: "11px",
								fontWeight: 600,
								borderRadius: "4px",
								border: `1px solid ${sortBy === key ? "var(--text-accent)" : "var(--border-light)"}`,
								background: sortBy === key ? "var(--bg-accent-light)" : "transparent",
								color: sortBy === key ? "var(--text-accent)" : "var(--text-muted)",
								cursor: "pointer",
								fontFamily: "inherit",
							}}
						>
							{key === "score" ? "Worst first" : "By URL"}
						</button>
					))}
				</div>
			</div>

			<div style={{
				border: "1px solid var(--border)",
				borderRadius: "var(--radius-md)",
				overflow: "hidden",
			}}>
				<table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
					<thead>
						<tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
							<th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
								Page
							</th>
							<th style={{ textAlign: "center", padding: "8px 12px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", width: "80px" }}>
								Score
							</th>
							<th style={{ textAlign: "center", padding: "8px 12px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", width: "60px" }}>
								Grade
							</th>
						</tr>
					</thead>
					<tbody>
						{displayed.map((page, i) => (
							<tr
								key={page.url}
								style={{
									borderBottom: i < displayed.length - 1 ? "1px solid var(--border-light)" : "none",
									background: "var(--bg-card)",
								}}
							>
								<td style={{ padding: "10px 12px" }}>
									<div style={{ fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "500px" }}>
										{page.title}
									</div>
									<div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "500px" }}>
										{new URL(page.url).pathname}
									</div>
								</td>
								<td style={{ textAlign: "center", fontVariantNumeric: "tabular-nums", fontWeight: 600, color: scoreColor(page.score) }}>
									{page.score}
								</td>
								<td style={{ textAlign: "center" }}>
									<span style={{
										display: "inline-block",
										padding: "2px 8px",
										borderRadius: "4px",
										fontSize: "12px",
										fontWeight: 700,
										color: scoreColor(page.score),
										background: page.score >= 70 ? "var(--green-bg)" : page.score >= 40 ? "var(--amber-bg)" : "var(--red-bg)",
									}}>
										{page.grade}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{pages.length > 10 && (
				<button
					type="button"
					onClick={() => setExpanded(!expanded)}
					style={{
						marginTop: "8px",
						padding: "6px 14px",
						fontSize: "12px",
						fontWeight: 600,
						color: "var(--text-accent)",
						background: "transparent",
						border: "1px solid var(--border)",
						borderRadius: "6px",
						cursor: "pointer",
						fontFamily: "inherit",
					}}
				>
					{expanded ? "Show less" : `Show all ${pages.length} pages`}
				</button>
			)}
		</div>
	);
}
