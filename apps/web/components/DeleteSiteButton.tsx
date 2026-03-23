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
			<div className="flex items-center gap-4 animate-slide-down" onClick={(e) => e.preventDefault()}>
				<span className="text-xs font-medium" style={{ color: "var(--red)" }}>
					Delete {siteUrl}?
				</span>
				<button
					type="button"
					onClick={handleDelete}
					disabled={deleting}
					className="btn btn-danger btn-sm"
				>
					{deleting ? "Deleting..." : "Confirm"}
				</button>
				<button
					type="button"
					onClick={() => setConfirming(false)}
					className="btn btn-secondary btn-sm"
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
			className="btn-icon btn-icon-danger"
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
