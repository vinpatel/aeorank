"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ScanStatusProps {
	scanId: string;
	initialStatus: string;
}

export function ScanStatus({ scanId, initialStatus }: ScanStatusProps) {
	const router = useRouter();
	const [status, setStatus] = useState(initialStatus);
	const [progress, setProgress] = useState(0);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (status !== "pending" && status !== "running") return;

		const interval = setInterval(async () => {
			try {
				const res = await fetch(`/api/scan/status?id=${encodeURIComponent(scanId)}`);
				if (!res.ok) return;

				const data = (await res.json()) as { status: string; error?: string; progress?: number };
				setStatus(data.status);
				if (data.progress != null) setProgress(data.progress);

				if (data.status === "complete") {
					clearInterval(interval);
					router.refresh();
				} else if (data.status === "error") {
					clearInterval(interval);
					setErrorMessage(data.error ?? "Scan failed. Please try again.");
				}
			} catch {
				// Network hiccup — keep polling
			}
		}, 3000);

		return () => clearInterval(interval);
	}, [scanId, status, router]);

	if (status === "error") {
		return (
			<div className="alert alert-error">
				<p className="font-semibold">Scan failed</p>
				{errorMessage && (
					<p className="text-sm mt-1">{errorMessage}</p>
				)}
			</div>
		);
	}

	const label = status === "running"
		? progress > 0 ? `Scanning your site... ${progress}%` : "Scanning your site..."
		: "Queued — scan starting soon...";

	return (
		<div className="card animate-fade-in bg-surface">
			<div className={`flex items-center gap-3 ${progress > 0 ? "mb-4" : ""}`}>
				<div className="spinner spinner-md" />
				<div>
					<p className="font-semibold">{label}</p>
					<p className="text-sm text-secondary mt-0.5">
						This typically takes 10–60 seconds.
					</p>
				</div>
			</div>
			{progress > 0 && (
				<div className="progress-bar progress-bar-animated">
					<div className="progress-bar-fill" style={{ width: `${progress}%` }} />
				</div>
			)}
		</div>
	);
}
