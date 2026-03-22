"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RetryScanButtonProps {
	url: string;
}

export function RetryScanButton({ url }: RetryScanButtonProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleRetry() {
		setLoading(true);
		try {
			const res = await fetch("/api/scan", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url }),
			});
			if (res.ok) {
				router.refresh();
			}
		} catch {
			// Ignore — page will show current state
		} finally {
			setLoading(false);
		}
	}

	return (
		<button
			onClick={handleRetry}
			disabled={loading}
			type="button"
			style={{
				marginTop: "12px",
				padding: "8px 20px",
				background: loading ? "var(--text-secondary)" : "var(--bg-accent)",
				color: "#fff",
				border: "none",
				borderRadius: "var(--radius-sm)",
				fontSize: "14px",
				fontWeight: 600,
				fontFamily: "inherit",
				cursor: loading ? "not-allowed" : "pointer",
			}}
		>
			{loading ? "Retrying..." : "Retry Scan"}
		</button>
	);
}
