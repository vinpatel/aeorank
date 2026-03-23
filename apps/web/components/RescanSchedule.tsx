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
		<div className="flex items-center gap-4">
			<span className="text-xs text-secondary font-medium">Auto-rescan:</span>
			<div className="flex gap-2">
				{SCHEDULES.map((s) => (
					<button
						key={s.label}
						type="button"
						disabled={saving}
						onClick={() => handleChange(s.value)}
						className={`btn-toggle ${saving ? "cursor-wait" : "cursor-pointer"} ${schedule === s.value ? "btn-toggle-active" : ""}`}
					>
						{s.label}
					</button>
				))}
			</div>
		</div>
	);
}
