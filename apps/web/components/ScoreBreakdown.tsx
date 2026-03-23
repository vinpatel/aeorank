import type { DimensionScore } from "@aeorank/core";

interface ScoreBreakdownProps {
	score: number;
	grade: string;
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

function weightLabel(weight: "high" | "medium" | "low"): string {
	if (weight === "high") return "High";
	if (weight === "medium") return "Med";
	return "Low";
}

function weightBadgeClass(weight: "high" | "medium" | "low"): string {
	if (weight === "high") return "badge badge-red";
	if (weight === "medium") return "badge badge-amber";
	return "badge badge-green";
}

export function ScoreBreakdown({ score, grade, dimensions }: ScoreBreakdownProps) {
	return (
		<div>
			{/* Score header */}
			<div className="card card-gradient flex items-center gap-16 mb-12 p-7">
				<div className="text-center min-w-score">
					<div className={`score-xl animate-count-up ${scoreColorClass(score)}`}>{score}</div>
					<div className="score-caption">out of 100</div>
				</div>
				<div className="divider-vertical" />
				<div>
					<div className={`score-lg animate-grade-bounce ${scoreColorClass(score)}`}>{grade}</div>
					<div className="score-caption">AEO grade</div>
				</div>
			</div>

			{/* Dimension table */}
			<div className="table-wrap">
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
								<td className={`text-center tabular-nums font-semibold ${scoreColorClass(Math.round((dim.score / dim.maxScore) * 100))}`}>
									{dim.score}/{dim.maxScore}
								</td>
								<td className="text-center">
									<span className={weightBadgeClass(dim.weight)}>
										{weightLabel(dim.weight)}
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
		</div>
	);
}
