"use client";

import { useState } from "react";
import {
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	Legend,
} from "recharts";

interface DimensionHistory {
	id: string;
	name: string;
	weight: "high" | "medium" | "low";
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
								<div
									style={{
										background: "#1a1a1a",
										color: "#fff",
										padding: "10px 14px",
										borderRadius: "6px",
										fontSize: "12px",
										maxHeight: "260px",
										overflowY: "auto",
									}}
								>
									<div style={{ fontWeight: 600, marginBottom: "6px", color: "#9ca3af" }}>
										{formatDate(label as string)}
									</div>
									{sorted.map((entry) => (
										<div
											key={entry.dataKey as string}
											style={{
												display: "flex",
												justifyContent: "space-between",
												gap: "16px",
												padding: "1px 0",
											}}
										>
											<span style={{ color: entry.color as string }}>
												{entry.name}
											</span>
											<span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
												{entry.value}/10
											</span>
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
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: "6px 12px",
					marginTop: "12px",
					fontSize: "12px",
				}}
			>
				{dimensions.map((dim) => {
					const delta = trends.get(dim.id) ?? 0;
					const isHidden = hidden.has(dim.id);
					return (
						<button
							key={dim.id}
							type="button"
							onClick={() => toggleDimension(dim.id)}
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "4px",
								padding: "3px 8px",
								borderRadius: "4px",
								border: "1px solid var(--border-light)",
								background: isHidden ? "transparent" : "var(--bg-surface)",
								color: isHidden ? "var(--text-muted)" : "var(--text)",
								cursor: "pointer",
								opacity: isHidden ? 0.4 : 1,
								fontFamily: "inherit",
								fontSize: "11px",
								lineHeight: 1.4,
								transition: "opacity 0.15s",
							}}
						>
							<span
								style={{
									display: "inline-block",
									width: "8px",
									height: "8px",
									borderRadius: "2px",
									background: DIMENSION_COLORS[dim.id] ?? "#888",
								}}
							/>
							{dim.name}
							{delta !== 0 && (
								<span
									style={{
										color: delta > 0 ? "var(--green)" : "var(--red)",
										fontWeight: 600,
										fontSize: "10px",
									}}
								>
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
