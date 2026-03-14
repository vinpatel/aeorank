"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddSiteForm() {
	const router = useRouter();
	const [url, setUrl] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const res = await fetch("/api/scan", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url }),
			});

			const data = (await res.json()) as { siteId?: string; error?: string };

			if (!res.ok) {
				setError(data.error ?? "Something went wrong. Please try again.");
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
					padding: "8px 12px",
					border: "1px solid #d1d5db",
					borderRadius: "6px",
					fontSize: "14px",
					outline: "none",
				}}
			/>
			<button
				type="submit"
				disabled={loading}
				style={{
					padding: "8px 20px",
					background: loading ? "#6b7280" : "#111",
					color: "#fff",
					border: "none",
					borderRadius: "6px",
					fontSize: "14px",
					fontWeight: 600,
					cursor: loading ? "not-allowed" : "pointer",
					whiteSpace: "nowrap",
				}}
			>
				{loading ? "Scanning..." : "Scan site"}
			</button>
			{error && (
				<p style={{ width: "100%", color: "#dc2626", fontSize: "14px", margin: 0 }}>
					{error}
				</p>
			)}
		</form>
	);
}
