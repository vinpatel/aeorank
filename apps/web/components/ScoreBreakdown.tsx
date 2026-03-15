import type { DimensionScore } from "@aeorank/core";

interface ScoreBreakdownProps {
	score: number;
	grade: string;
	dimensions: DimensionScore[];
}

function scoreColor(score: number): string {
	if (score >= 70) return "var(--green)";
	if (score >= 40) return "var(--amber)";
	return "var(--red)";
}

function statusColor(status: "pass" | "warn" | "fail"): string {
	if (status === "pass") return "var(--green)";
	if (status === "warn") return "var(--amber)";
	return "var(--red)";
}

function weightLabel(weight: "high" | "medium" | "low"): string {
	if (weight === "high") return "High";
	if (weight === "medium") return "Med";
	return "Low";
}

function weightBg(weight: "high" | "medium" | "low"): string {
	if (weight === "high") return "var(--red-bg)";
	if (weight === "medium") return "var(--amber-bg)";
	return "var(--green-bg)";
}

function weightTextColor(weight: "high" | "medium" | "low"): string {
	if (weight === "high") return "var(--red)";
	if (weight === "medium") return "var(--amber)";
	return "var(--green)";
}

export function ScoreBreakdown({ score, grade, dimensions }: ScoreBreakdownProps) {
	const color = scoreColor(score);

	return (
		<div>
			{/* Score header */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "20px",
					marginBottom: "32px",
					padding: "28px",
					border: "1px solid var(--border)",
					borderRadius: "var(--radius-lg)",
					background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-surface) 100%)",
					boxShadow: "var(--shadow-md)",
				}}
			>
				<div style={{ textAlign: "center", minWidth: "90px" }}>
					<div style={{
						fontFamily: "var(--font-display)",
						fontSize: "60px",
						fontWeight: 700,
						color,
						lineHeight: 1,
						letterSpacing: "-0.03em",
					}}>
						{score}
					</div>
					<div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
						out of 100
					</div>
				</div>
				<div
					style={{
						width: "1px",
						height: "64px",
						background: "var(--border)",
					}}
				/>
				<div>
					<div
						style={{
							fontFamily: "var(--font-display)",
							fontSize: "44px",
							fontWeight: 700,
							color,
							lineHeight: 1,
							letterSpacing: "-0.02em",
						}}
					>
						{grade}
					</div>
					<div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
						AEO grade
					</div>
				</div>
			</div>

			{/* Dimension table */}
			<div style={{
				border: "1px solid var(--border)",
				borderRadius: "var(--radius-md)",
				overflow: "hidden",
				boxShadow: "var(--shadow-card)",
			}}>
				<table
					style={{
						width: "100%",
						borderCollapse: "collapse",
						fontSize: "14px",
					}}
				>
					<thead>
						<tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
							<th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", width: "35%" }}>
								Dimension
							</th>
							<th style={{ textAlign: "center", padding: "10px 12px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", width: "12%" }}>
								Score
							</th>
							<th style={{ textAlign: "center", padding: "10px 12px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", width: "10%" }}>
								Weight
							</th>
							<th style={{ textAlign: "center", padding: "10px 12px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", width: "10%" }}>
								Status
							</th>
							<th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
								Hint
							</th>
						</tr>
					</thead>
					<tbody>
						{dimensions.map((dim, index) => (
							<tr
								key={dim.id}
								style={{
									borderBottom: index < dimensions.length - 1 ? "1px solid var(--border-light)" : "none",
									background: "var(--bg-card)",
								}}
							>
								<td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--text)" }}>
									{dim.name}
								</td>
								<td style={{
									padding: "12px 12px",
									textAlign: "center",
									fontVariantNumeric: "tabular-nums",
									color: scoreColor(Math.round((dim.score / dim.maxScore) * 100)),
									fontWeight: 600,
								}}>
									{dim.score}/{dim.maxScore}
								</td>
								<td style={{ padding: "12px 12px", textAlign: "center" }}>
									<span style={{
										display: "inline-block",
										padding: "2px 8px",
										borderRadius: "9999px",
										fontSize: "11px",
										fontWeight: 600,
										background: weightBg(dim.weight),
										color: weightTextColor(dim.weight),
									}}>
										{weightLabel(dim.weight)}
									</span>
								</td>
								<td style={{ padding: "12px 12px", textAlign: "center" }}>
									<span style={{
										display: "inline-flex",
										alignItems: "center",
										gap: "5px",
									}}>
										<span style={{
											display: "inline-block",
											width: "8px",
											height: "8px",
											borderRadius: "50%",
											background: statusColor(dim.status),
										}} />
										<span style={{ color: statusColor(dim.status), fontWeight: 500, fontSize: "13px" }}>
											{dim.status.charAt(0).toUpperCase() + dim.status.slice(1)}
										</span>
									</span>
								</td>
								<td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: "13px" }}>
									{dim.hint}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
