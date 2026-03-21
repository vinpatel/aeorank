import type { PlanKey } from "@/lib/stripe";

interface PlanBadgeProps {
	plan: PlanKey;
}

const BADGE_STYLES: Record<PlanKey, { bg: string; text: string; label: string }> = {
	free: { bg: "rgba(255,255,255,0.1)", text: "rgba(255,255,255,0.6)", label: "Free" },
	pro: { bg: "#E8590C", text: "#ffffff", label: "Pro" },
	api: { bg: "#3B82F6", text: "#ffffff", label: "API" },
	admin: { bg: "#8B5CF6", text: "#ffffff", label: "Admin" },
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
