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

/** Hardcoded id->name map for the 25 page-level dimensions.
 *  Avoids importing @aeorank/core in the browser bundle. */
const DIMENSION_NAMES: Record<string, string> = {
	"content-structure": "Content Structure",
	"answer-first": "Answer-First Formatting",
	"meta-descriptions": "Meta Descriptions",
	"page-freshness": "Page Freshness",
	"citation-anchors": "Citation Anchors",
	"schema-markup": "Schema.org Markup",
	"eeat-signals": "E-E-A-T Signals",
	"fact-density": "Fact & Data Density",
	"duplicate-content": "Duplicate Content",
	"evidence-packaging": "Evidence Packaging",
	"citation-ready-writing": "Citation-Ready Writing",
	"qa-format": "Q&A Content Format",
	"direct-answer-density": "Direct Answer Density",
	"query-answer-alignment": "Query-Answer Alignment",
	"tables-lists": "Tables & Lists",
	"definition-patterns": "Definition Patterns",
	"entity-disambiguation": "Entity Disambiguation",
	"internal-linking": "Internal Linking",
	"semantic-html": "Semantic HTML",
	"extraction-friction": "Extraction Friction",
	"image-context": "Image Context for AI",
	"schema-coverage": "Schema Coverage",
	"content-cannibalization": "Content Cannibalization",
	"canonical-urls": "Canonical URLs",
	"visible-dates": "Visible Date Signals",
};

function gradeBgClass(score: number): string {
	if (score >= 70) return "badge-green";
	if (score >= 40) return "badge-amber";
	return "badge-red";
}

function statusBadgeClass(status: "pass" | "warn" | "fail"): string {
	if (status === "pass") return "badge-green";
	if (status === "warn") return "badge-amber";
	return "badge-red";
}

function statusLabel(status: "pass" | "warn" | "fail"): string {
	if (status === "pass") return "pass";
	if (status === "warn") return "warn";
	return "fail";
}

const STATUS_ORDER = { fail: 0, warn: 1, pass: 2 };

export function PageScores({ pages }: PageScoresProps) {
	const [expanded, setExpanded] = useState(false);
	const [sortBy, setSortBy] = useState<"score" | "url">("score");
	const [expandedPage, setExpandedPage] = useState<string | null>(null);

	if (pages.length === 0) return null;

	const sorted = [...pages].sort((a, b) =>
		sortBy === "score" ? a.score - b.score : a.url.localeCompare(b.url),
	);

	const displayed = expanded ? sorted : sorted.slice(0, 10);

	function togglePage(url: string) {
		setExpandedPage((prev) => (prev === url ? null : url));
	}

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
						{displayed.map((page) => {
							const isExpanded = expandedPage === page.url;
							const sortedDims = [...page.dimensions].sort(
								(a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
							);

							return (
								<>
									<tr
										key={page.url}
										onClick={() => togglePage(page.url)}
										style={{ cursor: "pointer" }}
									>
										<td className="cell-padded">
											<div className="flex items-center gap-2">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="14"
													height="14"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
													style={{
														flexShrink: 0,
														transition: "transform 0.15s",
														transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
														color: "var(--text-muted, #888)",
													}}
												>
													<polyline points="9 18 15 12 9 6" />
												</svg>
												<div style={{ minWidth: 0 }}>
													<div className="font-medium truncate page-title">
														{page.title}
													</div>
													<div className="text-xs text-muted truncate page-path">
														{new URL(page.url).pathname}
													</div>
												</div>
											</div>
										</td>
										<td className={`text-center tabular-nums font-semibold score-${page.score >= 70 ? "green" : page.score >= 40 ? "amber" : "red"}`}>
											{page.score}/75
										</td>
										<td className="text-center">
											<span className={`grade-badge-sm ${gradeBgClass(page.score)}`}>
												{page.grade}
											</span>
										</td>
									</tr>
									{isExpanded && (
										<tr key={`${page.url}-expanded`}>
											<td colSpan={3} style={{ padding: 0 }}>
												<div
													style={{
														background: "var(--surface-2, #f5f4f2)",
														padding: "0.75rem 1rem 0.75rem 2.5rem",
													}}
												>
													<table className="table table-sm" style={{ marginBottom: 0 }}>
														<thead>
															<tr>
																<th>Dimension</th>
																<th className="text-center">Score</th>
																<th className="text-center">Status</th>
															</tr>
														</thead>
														<tbody>
															{sortedDims.map((dim) => (
																<tr key={dim.id}>
																	<td>{DIMENSION_NAMES[dim.id] ?? dim.id}</td>
																	<td className="text-center tabular-nums">
																		{dim.score}/10
																	</td>
																	<td className="text-center">
																		<span className={`grade-badge-sm ${statusBadgeClass(dim.status)}`}>
																			{statusLabel(dim.status)}
																		</span>
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</td>
										</tr>
									)}
								</>
							);
						})}
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
