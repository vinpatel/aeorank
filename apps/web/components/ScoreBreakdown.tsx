import { PILLAR_GROUPS } from "@aeorank/core";
import type { DimensionScore } from "@aeorank/core";
import { PillarSection } from "./PillarSection";

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

function calcPillarScore(dims: DimensionScore[]): number {
	let weightedSum = 0;
	let weightedMax = 0;
	for (const dim of dims) {
		weightedSum += dim.score * dim.weightPct;
		weightedMax += dim.maxScore * dim.weightPct;
	}
	if (weightedMax === 0) return 0;
	return Math.round((weightedSum / weightedMax) * 100);
}

export function ScoreBreakdown({ score, grade, dimensions }: ScoreBreakdownProps) {
	// Build a lookup map for fast access
	const dimMap = new Map(dimensions.map((d) => [d.id, d]));

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

			{/* Pillar sections — Answer Readiness, Content Structure, Trust & Authority, Technical Foundation, AI Discovery */}
			{PILLAR_GROUPS.map((pillar) => {
				// Collect dimensions for this pillar (skip missing for backwards compat)
				const pillarDims = pillar.dimensionIds
					.map((id) => dimMap.get(id))
					.filter((d): d is DimensionScore => d !== undefined)
					.sort((a, b) => b.weightPct - a.weightPct);

				const pillarScore = calcPillarScore(pillarDims);

				return (
					<PillarSection
						key={pillar.id}
						name={pillar.name}
						pillarScore={pillarScore}
						dimensions={pillarDims}
					/>
				);
			})}
		</div>
	);
}
