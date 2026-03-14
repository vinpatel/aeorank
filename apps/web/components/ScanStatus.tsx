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
				background: "#fef2f2",
				border: "1px solid #fecaca",
				borderRadius: "8px",
				color: "#dc2626",
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
			background: "#f9fafb",
			border: "1px solid #e5e7eb",
			borderRadius: "8px",
			display: "flex",
			alignItems: "center",
			gap: "12px",
		}}>
			<div
				style={{
					width: "20px",
					height: "20px",
					border: "2px solid #d1d5db",
					borderTopColor: "#111",
					borderRadius: "50%",
					animation: "spin 0.8s linear infinite",
				}}
			/>
			<div>
				<p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
				<p style={{ margin: "2px 0 0", fontSize: "14px", color: "#6b7280" }}>
					This typically takes 10–30 seconds.
				</p>
			</div>
			<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
		</div>
	);
}
