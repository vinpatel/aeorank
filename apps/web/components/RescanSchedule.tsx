"use client";

import { useState } from "react";

interface RescanScheduleProps {
	siteId: string;
	currentSchedule: string | null;
}

const SCHEDULES = [
	{ value: null, label: "Off" },
	{ value: "daily", label: "Daily" },
	{ value: "weekly", label: "Weekly" },
	{ value: "monthly", label: "Monthly" },
];

export function RescanSchedule({ siteId, currentSchedule }: RescanScheduleProps) {
	const [schedule, setSchedule] = useState(currentSchedule);
	const [saving, setSaving] = useState(false);

	async function handleChange(value: string | null) {
		setSaving(true);
		setSchedule(value);
		try {
			await fetch(`/api/sites/${siteId}/schedule`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ schedule: value }),
				credentials: "include",
			});
		} catch {
			setSchedule(currentSchedule);
		} finally {
			setSaving(false);
		}
	}

	return (
		<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
			<span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
				Auto-rescan:
			</span>
			<div style={{ display: "flex", gap: "4px" }}>
				{SCHEDULES.map((s) => (
					<button
						key={s.label}
						type="button"
						disabled={saving}
						onClick={() => handleChange(s.value)}
						style={{
							padding: "4px 10px",
							fontSize: "12px",
							fontWeight: 600,
							borderRadius: "6px",
							border: `1px solid ${schedule === s.value ? "var(--text-accent)" : "var(--border)"}`,
							background: schedule === s.value ? "var(--bg-accent-light)" : "transparent",
							color: schedule === s.value ? "var(--text-accent)" : "var(--text-muted)",
							cursor: saving ? "wait" : "pointer",
							transition: "all 0.15s",
							fontFamily: "inherit",
						}}
					>
						{s.label}
					</button>
				))}
			</div>
		</div>
	);
}
