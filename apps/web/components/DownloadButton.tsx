"use client";

import { useState } from "react";

interface DownloadButtonProps {
	siteId: string;
	disabled?: boolean;
}

export function DownloadButton({ siteId, disabled = false }: DownloadButtonProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleDownload() {
		if (disabled || loading) return;
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/download/${siteId}`, {
				credentials: "include",
			});

			if (!response.ok) {
				const text = await response.text();
				setError(text || "Download failed");
				return;
			}

			// Get filename from Content-Disposition header
			const disposition = response.headers.get("Content-Disposition") ?? "";
			const filenameMatch = disposition.match(/filename="([^"]+)"/);
			const filename = filenameMatch ? filenameMatch[1] : "aeorank-files.zip";

			// Trigger browser download
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = filename;
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
			URL.revokeObjectURL(url);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Download failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div>
			<button
				type="button"
				onClick={handleDownload}
				disabled={disabled || loading}
				style={{
					display: "inline-flex",
					alignItems: "center",
					gap: "8px",
					padding: "10px 20px",
					background: disabled ? "var(--text-muted)" : "var(--bg-accent)",
					color: "#fff",
					border: "none",
					borderRadius: "var(--radius-sm)",
					fontSize: "14px",
					fontWeight: 600,
					cursor: disabled || loading ? "not-allowed" : "pointer",
					opacity: disabled ? 0.6 : 1,
					transition: "opacity 0.15s",
				}}
			>
				{loading ? (
					<>
						<span
							style={{
								display: "inline-block",
								width: "14px",
								height: "14px",
								border: "2px solid rgba(255,255,255,0.3)",
								borderTopColor: "#fff",
								borderRadius: "50%",
								animation: "spin 0.7s linear infinite",
							}}
						/>
						Preparing download...
					</>
				) : (
					"Download all files (ZIP)"
				)}
			</button>
			{error && (
				<p
					style={{
						marginTop: "8px",
						fontSize: "13px",
						color: "var(--red)",
					}}
				>
					{error}
				</p>
			)}
		</div>
	);
}
