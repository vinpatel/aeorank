import type { DimensionScore } from "@aeorank/core";

interface ScoreBreakdownProps {
	score: number;
	grade: string;
	dimensions: DimensionScore[];
}

function scoreColor(score: number): string {
	if (score >= 70) return "#16a34a"; // green-600
	if (score >= 40) return "#d97706"; // amber-600
	return "#dc2626"; // red-600
}

function statusColor(status: "pass" | "warn" | "fail"): string {
	if (status === "pass") return "#16a34a";
	if (status === "warn") return "#d97706";
	return "#dc2626";
}

function weightLabel(weight: "high" | "medium" | "low"): string {
	if (weight === "high") return "High";
	if (weight === "medium") return "Med";
	return "Low";
}

function weightBg(weight: "high" | "medium" | "low"): string {
	if (weight === "high") return "#fee2e2";
	if (weight === "medium") return "#fef3c7";
	return "#f0fdf4";
}

function weightTextColor(weight: "high" | "medium" | "low"): string {
	if (weight === "high") return "#991b1b";
	if (weight === "medium") return "#92400e";
	return "#166534";
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
					gap: "16px",
					marginBottom: "32px",
					padding: "24px",
					border: "1px solid #e5e7eb",
					borderRadius: "12px",
					background: "#f9fafb",
				}}
			>
				<div style={{ textAlign: "center", minWidth: "80px" }}>
					<div style={{ fontSize: "56px", fontWeight: 800, color, lineHeight: 1 }}>
						{score}
					</div>
					<div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
						out of 100
					</div>
				</div>
				<div
					style={{
						width: "1px",
						height: "60px",
						background: "#e5e7eb",
					}}
				/>
				<div>
					<div
						style={{
							fontSize: "40px",
							fontWeight: 800,
							color,
							lineHeight: 1,
						}}
					>
						{grade}
					</div>
					<div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
						AEO grade
					</div>
				</div>
			</div>

			{/* Dimension table */}
			<table
				style={{
					width: "100%",
					borderCollapse: "collapse",
					fontSize: "14px",
				}}
			>
				<thead>
					<tr style={{ borderBottom: "1px solid #e5e7eb" }}>
						<th
							style={{
								textAlign: "left",
								padding: "8px 12px",
								fontWeight: 600,
								color: "#374151",
								width: "40%",
							}}
						>
							Dimension
						</th>
						<th
							style={{
								textAlign: "center",
								padding: "8px 12px",
								fontWeight: 600,
								color: "#374151",
								width: "15%",
							}}
						>
							Score
						</th>
						<th
							style={{
								textAlign: "center",
								padding: "8px 12px",
								fontWeight: 600,
								color: "#374151",
								width: "12%",
							}}
						>
							Weight
						</th>
						<th
							style={{
								textAlign: "center",
								padding: "8px 12px",
								fontWeight: 600,
								color: "#374151",
								width: "12%",
							}}
						>
							Status
						</th>
						<th
							style={{
								textAlign: "left",
								padding: "8px 12px",
								fontWeight: 600,
								color: "#374151",
							}}
						>
							Hint
						</th>
					</tr>
				</thead>
				<tbody>
					{dimensions.map((dim) => (
						<tr
							key={dim.id}
							style={{ borderBottom: "1px solid #f3f4f6" }}
						>
							<td
								style={{
									padding: "10px 12px",
									fontWeight: 500,
									color: "#111",
								}}
							>
								{dim.name}
							</td>
							<td
								style={{
									padding: "10px 12px",
									textAlign: "center",
									fontVariantNumeric: "tabular-nums",
									color: scoreColor(Math.round((dim.score / dim.maxScore) * 100)),
									fontWeight: 600,
								}}
							>
								{dim.score}/{dim.maxScore}
							</td>
							<td style={{ padding: "10px 12px", textAlign: "center" }}>
								<span
									style={{
										display: "inline-block",
										padding: "2px 8px",
										borderRadius: "9999px",
										fontSize: "12px",
										fontWeight: 600,
										background: weightBg(dim.weight),
										color: weightTextColor(dim.weight),
									}}
								>
									{weightLabel(dim.weight)}
								</span>
							</td>
							<td style={{ padding: "10px 12px", textAlign: "center" }}>
								<span
									style={{
										display: "inline-block",
										width: "8px",
										height: "8px",
										borderRadius: "50%",
										background: statusColor(dim.status),
										marginRight: "4px",
									}}
								/>
								<span style={{ color: statusColor(dim.status), fontWeight: 500 }}>
									{dim.status.charAt(0).toUpperCase() + dim.status.slice(1)}
								</span>
							</td>
							<td
								style={{
									padding: "10px 12px",
									color: "#6b7280",
									fontSize: "13px",
								}}
							>
								{dim.hint}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
