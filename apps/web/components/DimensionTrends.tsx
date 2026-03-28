"use client";

import { useState } from "react";
import {
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface DimensionHistory {
	id: string;
	name: string;
	weightPct: number;
}

type TrendDataPoint = Record<string, string | number>;

interface DimensionTrendsProps {
	data: TrendDataPoint[];
	dimensions: DimensionHistory[];
}

const DIMENSION_COLORS: Record<string, string> = {
	"llms-txt": "#E8590C",
	"schema-markup": "#2563EB",
	"ai-crawler-access": "#7C3AED",
	"content-structure": "#059669",
	"answer-first": "#D97706",
	"faq-speakable": "#DC2626",
	"eeat-signals": "#0891B2",
	"meta-descriptions": "#4F46E5",
	sitemap: "#65A30D",
	"https-redirects": "#0D9488",
	"page-freshness": "#EA580C",
	"citation-anchors": "#9333EA",
};

function formatDate(dateStr: string): string {
	const d = new Date(dateStr);
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DimensionTrends({ data, dimensions }: DimensionTrendsProps) {
	const [hidden, setHidden] = useState<Set<string>>(new Set());

	if (data.length < 2) return null;

	const toggleDimension = (id: string) => {
		setHidden((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	// Calculate trend arrows (compare last two data points)
	const latest = data[data.length - 1];
	const previous = data[data.length - 2];
	const trends = new Map<string, number>();
	for (const dim of dimensions) {
		const curr = (latest[dim.id] as number) ?? 0;
		const prev = (previous[dim.id] as number) ?? 0;
		trends.set(dim.id, curr - prev);
	}

	return (
		<div>
			<ResponsiveContainer width="100%" height={240}>
				<LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 4 }}>
					<XAxis
						dataKey="date"
						tickFormatter={formatDate}
						tick={{ fontSize: 11, fill: "var(--text-muted)" }}
						axisLine={false}
						tickLine={false}
					/>
					<YAxis
						domain={[0, 10]}
						tick={{ fontSize: 11, fill: "var(--text-muted)" }}
						axisLine={false}
						tickLine={false}
					/>
					<Tooltip
						content={({ active, payload, label }) => {
							if (!active || !payload || payload.length === 0) return null;
							const sorted = [...payload].sort(
								(a, b) => ((b.value as number) ?? 0) - ((a.value as number) ?? 0),
							);
							return (
								<div className="chart-tooltip dimension-tooltip">
									<div className="chart-tooltip-label font-semibold mb-1.5">
										{formatDate(label as string)}
									</div>
									{sorted.map((entry) => (
										<div
											key={entry.dataKey as string}
											className="flex justify-between gap-4 dimension-tooltip-row"
										>
											<span style={{ color: entry.color as string }}>{entry.name}</span>
											<span className="font-semibold tabular-nums">{entry.value}/10</span>
										</div>
									))}
								</div>
							);
						}}
					/>
					{dimensions
						.filter((d) => !hidden.has(d.id))
						.map((dim) => (
							<Line
								key={dim.id}
								type="monotone"
								dataKey={dim.id}
								name={dim.name}
								stroke={DIMENSION_COLORS[dim.id] ?? "#888"}
								strokeWidth={1.5}
								dot={false}
								activeDot={{ r: 3 }}
							/>
						))}
				</LineChart>
			</ResponsiveContainer>

			{/* Custom legend with trend arrows */}
			<div className="flex flex-wrap dimension-legend">
				{dimensions.map((dim) => {
					const delta = trends.get(dim.id) ?? 0;
					const isHidden = hidden.has(dim.id);
					return (
						<button
							key={dim.id}
							type="button"
							onClick={() => toggleDimension(dim.id)}
							className={`legend-chip ${isHidden ? "legend-chip-hidden" : ""}`}
						>
							<span className="legend-chip-dot" style={{ background: DIMENSION_COLORS[dim.id] ?? "#888" }} />
							{dim.name}
							{delta !== 0 && (
								<span className={`legend-chip-delta ${delta > 0 ? "legend-chip-delta-positive" : "legend-chip-delta-negative"}`}>
									{delta > 0 ? `+${delta}` : delta}
								</span>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
