"use client";

import { createCheckoutSession } from "@/app/(dashboard)/upgrade/actions";
import type { PaidPlanSlug } from "@/lib/checkout-plan";
import { useState } from "react";

interface CheckoutButtonProps {
	plan: PaidPlanSlug;
	label?: string;
	signedIn?: boolean;
}

export function CheckoutButton({ plan, label = "Upgrade", signedIn = true }: CheckoutButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (!signedIn) {
		return (
			<a href={`/sign-up?plan=${plan}`} className="btn btn-primary w-full">
				{label}
			</a>
		);
	}

	async function handleClick() {
		setIsLoading(true);
		setError(null);
		try {
			const result = await createCheckoutSession(plan);
			window.location.href = result.url;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to start checkout");
			setIsLoading(false);
		}
	}

	return (
		<>
			<button
				type="button"
				onClick={handleClick}
				disabled={isLoading}
				className="btn btn-primary w-full"
			>
				{isLoading ? "Redirecting to checkout..." : label}
			</button>
			{error && (
				<p className="text-xs mt-4" style={{ color: "var(--red)" }}>
					{error}
				</p>
			)}
		</>
	);
}
