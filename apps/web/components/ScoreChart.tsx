"use client";

import {
	Area,
	AreaChart,
	Dot,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface ScoreDataPoint {
	date: string;
	score: number;
}

interface ScoreChartProps {
	data: ScoreDataPoint[];
}

function formatDate(dateStr: string): string {
	const d = new Date(dateStr);
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ScoreChart({ data }: ScoreChartProps) {
	// Edge case: no data
	if (data.length === 0) {
		return (
			<div
				style={{
					height: "80px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: "var(--text-muted)",
					fontSize: "13px",
					border: "1px dashed var(--border)",
					borderRadius: "var(--radius-sm)",
				}}
			>
				No history yet
			</div>
		);
	}

	// Edge case: single data point — render a dot with the score
	if (data.length === 1) {
		return (
			<div style={{ height: "80px", position: "relative" }}>
				<ResponsiveContainer width="100%" height={80}>
					<AreaChart
						data={data}
						margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
					>
						<XAxis dataKey="date" hide />
						<YAxis domain={[0, 100]} hide />
						<Tooltip
							content={({ active, payload }) => {
								if (active && payload && payload.length > 0) {
									const point = payload[0].payload as ScoreDataPoint;
									return (
										<div
											style={{
												background: "#1a1a1a",
												color: "#fff",
												padding: "6px 10px",
												borderRadius: "4px",
												fontSize: "12px",
											}}
										>
											<div style={{ fontWeight: 600 }}>{point.score}/100</div>
											<div style={{ color: "#9ca3af" }}>
												{formatDate(point.date)}
											</div>
										</div>
									);
								}
								return null;
							}}
						/>
						<Area
							type="monotone"
							dataKey="score"
							stroke="#E8590C"
							fill="#E8590C"
							fillOpacity={0.1}
							dot={<Dot r={4} fill="#E8590C" stroke="#E8590C" />}
							activeDot={{ r: 5, fill: "#E8590C" }}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		);
	}

	// Normal sparkline for multiple data points
	return (
		<ResponsiveContainer width="100%" height={80}>
			<AreaChart
				data={data}
				margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
			>
				<XAxis dataKey="date" hide />
				<YAxis domain={[0, 100]} hide />
				<Tooltip
					content={({ active, payload }) => {
						if (active && payload && payload.length > 0) {
							const point = payload[0].payload as ScoreDataPoint;
							return (
								<div
									style={{
										background: "#1a1a1a",
										color: "#fff",
										padding: "6px 10px",
										borderRadius: "4px",
										fontSize: "12px",
									}}
								>
									<div style={{ fontWeight: 600 }}>{point.score}/100</div>
									<div style={{ color: "#9ca3af" }}>{formatDate(point.date)}</div>
								</div>
							);
						}
						return null;
					}}
				/>
				<Area
					type="monotone"
					dataKey="score"
					stroke="#E8590C"
					fill="#E8590C"
					fillOpacity={0.1}
					dot={false}
					activeDot={{ r: 4, fill: "#E8590C" }}
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}
