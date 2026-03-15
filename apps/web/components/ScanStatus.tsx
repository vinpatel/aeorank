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
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (status !== "pending" && status !== "running") return;

		const interval = setInterval(async () => {
			try {
				const res = await fetch(`/api/scan/status?id=${encodeURIComponent(scanId)}`);
				if (!res.ok) return;

				const data = (await res.json()) as { status: string; error?: string };
				setStatus(data.status);

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
			<div style={{
				padding: "16px",
				background: "var(--red-bg)",
				border: "1px solid #fecaca",
				borderRadius: "var(--radius-md)",
				color: "var(--red)",
			}}>
				<p style={{ margin: 0, fontWeight: 600 }}>Scan failed</p>
				{errorMessage && (
					<p style={{ margin: "4px 0 0", fontSize: "14px" }}>{errorMessage}</p>
				)}
			</div>
		);
	}

	const label = status === "running" ? "Scanning your site..." : "Queued — scan starting soon...";

	return (
		<div style={{
			padding: "24px",
			background: "var(--bg-surface)",
			border: "1px solid var(--border)",
			borderRadius: "var(--radius-md)",
			display: "flex",
			alignItems: "center",
			gap: "12px",
		}}>
			<div
				style={{
					width: "20px",
					height: "20px",
					border: "2px solid var(--border)",
					borderTopColor: "var(--bg-accent)",
					borderRadius: "50%",
					animation: "spin 0.8s linear infinite",
				}}
			/>
			<div>
				<p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
				<p style={{ margin: "2px 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
					This typically takes 10–30 seconds.
				</p>
			</div>
		</div>
	);
}
