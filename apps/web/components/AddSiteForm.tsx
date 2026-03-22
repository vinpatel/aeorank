"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddSiteForm() {
	const router = useRouter();
	const [url, setUrl] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLimitError, setIsLimitError] = useState(false);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setIsLimitError(false);
		setLoading(true);

		try {
			const res = await fetch("/api/scan", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url }),
			});

			const data = (await res.json()) as { siteId?: string; error?: string; code?: string };

			if (!res.ok) {
				setError(data.error ?? "Something went wrong. Please try again.");
				if (data.code === "SCAN_LIMIT" || data.code === "SITE_LIMIT") {
					setIsLimitError(true);
				}
				return;
			}

			if (data.siteId) {
				router.push(`/sites/${data.siteId}`);
			}
		} catch {
			setError("Network error. Please check your connection and try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
			<input
				type="url"
				value={url}
				onChange={(e) => setUrl(e.target.value)}
				placeholder="https://example.com"
				required
				disabled={loading}
				style={{
					flex: "1",
					minWidth: "240px",
					padding: "10px 14px",
					border: "1px solid var(--border)",
					borderRadius: "var(--radius-sm)",
					fontSize: "14px",
					outline: "none",
					background: "var(--bg-card)",
					fontFamily: "inherit",
					transition: "border-color 0.15s ease",
				}}
			/>
			<button
				type="submit"
				disabled={loading}
				style={{
					padding: "10px 24px",
					background: loading ? "var(--text-secondary)" : "var(--bg-accent)",
					color: "#fff",
					border: "none",
					borderRadius: "var(--radius-sm)",
					fontSize: "14px",
					fontWeight: 600,
					fontFamily: "inherit",
					cursor: loading ? "not-allowed" : "pointer",
					whiteSpace: "nowrap",
					transition: "background 0.15s ease",
				}}
			>
				{loading ? "Scanning..." : "Scan site"}
			</button>
			{error && (
				<div style={{ width: "100%", color: "var(--red)", fontSize: "14px", margin: 0 }}>
					<p style={{ margin: 0 }}>{error}</p>
					{isLimitError && (
						<a href="/upgrade" style={{ color: "var(--text-accent)", fontWeight: 600, fontSize: "13px" }}>
							View upgrade options &rarr;
						</a>
					)}
				</div>
			)}
		</form>
	);
}
