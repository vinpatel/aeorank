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
		<form onSubmit={handleSubmit} className="flex gap-4 flex-wrap">
			<input
				type="url"
				value={url}
				onChange={(e) => setUrl(e.target.value)}
				placeholder="https://example.com"
				required
				disabled={loading}
				className="input focus-ring"
			/>
			<button
				type="submit"
				disabled={loading}
				className="btn btn-primary"
			>
				{loading ? "Scanning..." : "Scan site"}
			</button>
			{error && (
				<div className="w-full text-error text-sm">
					<p className="m-0">{error}</p>
					{isLimitError && (
						<a href="/upgrade" className="btn-link text-xs mt-1 inline-block">
							View upgrade options &rarr;
						</a>
					)}
				</div>
			)}
		</form>
	);
}
