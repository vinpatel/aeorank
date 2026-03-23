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

function gradeBgClass(score: number): string {
	if (score >= 70) return "badge-green";
	if (score >= 40) return "badge-amber";
	return "badge-red";
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
			<div className="flex justify-between items-center mb-4">
				<p className="section-label m-0">
					Per-Page Scores ({pages.length} pages)
				</p>
				<div className="flex gap-2">
					{(["score", "url"] as const).map((key) => (
						<button
							key={key}
							type="button"
							onClick={() => setSortBy(key)}
							className={`btn-toggle ${sortBy === key ? "btn-toggle-active" : ""}`}
						>
							{key === "score" ? "Worst first" : "By URL"}
						</button>
					))}
				</div>
			</div>

			<div className="table-wrap">
				<table className="table table-sm">
					<thead>
						<tr>
							<th>Page</th>
							<th className="text-center col-score">Score</th>
							<th className="text-center col-grade">Grade</th>
						</tr>
					</thead>
					<tbody>
						{displayed.map((page) => (
							<tr key={page.url}>
								<td className="cell-padded">
									<div className="font-medium truncate page-title">
										{page.title}
									</div>
									<div className="text-xs text-muted truncate page-path">
										{new URL(page.url).pathname}
									</div>
								</td>
								<td className={`text-center tabular-nums font-semibold score-${page.score >= 70 ? "green" : page.score >= 40 ? "amber" : "red"}`}>
									{page.score}
								</td>
								<td className="text-center">
									<span className={`grade-badge-sm ${gradeBgClass(page.score)}`}>
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
					className="btn btn-ghost btn-sm mt-4 btn-show-more"
				>
					{expanded ? "Show less" : `Show all ${pages.length} pages`}
				</button>
			)}
		</div>
	);
}
