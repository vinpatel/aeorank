import type { PlanKey } from "@/lib/stripe";

interface PlanBadgeProps {
	plan: PlanKey;
}

const BADGE_STYLES: Record<PlanKey, { bg: string; text: string; label: string }> = {
	free: { bg: "#f3f4f6", text: "#374151", label: "Free" },
	pro: { bg: "#111827", text: "#ffffff", label: "Pro" },
	api: { bg: "#1d4ed8", text: "#ffffff", label: "API" },
};

/**
 * Small inline badge showing the user's current plan tier.
 * Server component — no client JS.
 */
export function PlanBadge({ plan }: PlanBadgeProps) {
	const { bg, text, label } = BADGE_STYLES[plan];

	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				padding: "2px 8px",
				borderRadius: "4px",
				fontSize: "11px",
				fontWeight: 600,
				letterSpacing: "0.05em",
				textTransform: "uppercase",
				backgroundColor: bg,
				color: text,
			}}
		>
			{label}
		</span>
	);
}
