"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteSiteButtonProps {
	siteId: string;
	siteUrl: string;
}

export function DeleteSiteButton({ siteId, siteUrl }: DeleteSiteButtonProps) {
	const router = useRouter();
	const [confirming, setConfirming] = useState(false);
	const [deleting, setDeleting] = useState(false);

	async function handleDelete() {
		setDeleting(true);
		try {
			const res = await fetch(`/api/sites/${siteId}`, { method: "DELETE" });
			if (res.ok) {
				router.refresh();
			}
		} catch {
			// Network error — ignore
		} finally {
			setDeleting(false);
			setConfirming(false);
		}
	}

	if (confirming) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "8px",
				}}
				onClick={(e) => e.preventDefault()}
			>
				<span style={{ fontSize: "12px", color: "var(--red)", fontWeight: 500 }}>
					Delete {siteUrl}?
				</span>
				<button
					type="button"
					onClick={handleDelete}
					disabled={deleting}
					style={{
						padding: "4px 10px",
						fontSize: "12px",
						fontWeight: 600,
						fontFamily: "inherit",
						background: "var(--red)",
						color: "#fff",
						border: "none",
						borderRadius: "var(--radius-sm)",
						cursor: deleting ? "not-allowed" : "pointer",
						opacity: deleting ? 0.7 : 1,
					}}
				>
					{deleting ? "Deleting..." : "Confirm"}
				</button>
				<button
					type="button"
					onClick={() => setConfirming(false)}
					style={{
						padding: "4px 10px",
						fontSize: "12px",
						fontWeight: 500,
						fontFamily: "inherit",
						background: "var(--bg-surface)",
						color: "var(--text-secondary)",
						border: "1px solid var(--border)",
						borderRadius: "var(--radius-sm)",
						cursor: "pointer",
					}}
				>
					Cancel
				</button>
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				setConfirming(true);
			}}
			title="Delete site"
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				width: "32px",
				height: "32px",
				background: "transparent",
				border: "1px solid transparent",
				borderRadius: "var(--radius-sm)",
				cursor: "pointer",
				color: "var(--text-muted)",
				transition: "all 0.15s ease",
				flexShrink: 0,
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.background = "var(--red-bg)";
				e.currentTarget.style.borderColor = "#fecaca";
				e.currentTarget.style.color = "var(--red)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.background = "transparent";
				e.currentTarget.style.borderColor = "transparent";
				e.currentTarget.style.color = "var(--text-muted)";
			}}
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<polyline points="3 6 5 6 21 6" />
				<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
				<line x1="10" y1="11" x2="10" y2="17" />
				<line x1="14" y1="11" x2="14" y2="17" />
			</svg>
		</button>
	);
}
