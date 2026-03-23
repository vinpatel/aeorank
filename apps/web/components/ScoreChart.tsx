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

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: ScoreDataPoint }[] }) {
	if (!active || !payload || payload.length === 0) return null;
	const point = payload[0].payload;
	return (
		<div className="chart-tooltip">
			<div className="chart-tooltip-value">{point.score}/100</div>
			<div className="chart-tooltip-label">{formatDate(point.date)}</div>
		</div>
	);
}

export function ScoreChart({ data }: ScoreChartProps) {
	// Edge case: no data
	if (data.length === 0) {
		return (
			<div className="flex items-center justify-center text-xs text-muted score-chart-empty">
				No history yet
			</div>
		);
	}

	// Edge case: single data point — render a dot with the score
	if (data.length === 1) {
		return (
			<div className="score-chart-single">
				<ResponsiveContainer width="100%" height={80}>
					<AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
						<XAxis dataKey="date" hide />
						<YAxis domain={[0, 100]} hide />
						<Tooltip content={<ChartTooltip />} />
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
			<AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
				<XAxis dataKey="date" hide />
				<YAxis domain={[0, 100]} hide />
				<Tooltip content={<ChartTooltip />} />
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
