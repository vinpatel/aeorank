"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
	EmbeddedCheckoutProvider,
	EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { createCheckoutSession } from "@/app/(dashboard)/upgrade/actions";

interface CheckoutButtonProps {
	priceId: string;
	plan: string;
	label?: string;
}

const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export function CheckoutButton({ priceId, plan, label = "Upgrade" }: CheckoutButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleClick() {
		setIsLoading(true);
		setError(null);
		try {
			const result = await createCheckoutSession(priceId, plan);
			setClientSecret(result.clientSecret);
			setIsOpen(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to start checkout");
		} finally {
			setIsLoading(false);
		}
	}

	function handleClose() {
		setIsOpen(false);
		setClientSecret(null);
	}

	return (
		<>
			<button
				type="button"
				onClick={handleClick}
				disabled={isLoading}
				className="btn btn-primary w-full"
			>
				{isLoading ? "Loading..." : label}
			</button>
			{error && (
				<p className="text-xs mt-4" style={{ color: "var(--red)" }}>{error}</p>
			)}
			{isOpen && clientSecret && (
				<div className="modal-overlay" onClick={handleClose}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<button
							type="button"
							onClick={handleClose}
							className="modal-close"
							aria-label="Close checkout"
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
						</button>
						<EmbeddedCheckoutProvider
							stripe={stripePromise}
							options={{ clientSecret }}
						>
							<EmbeddedCheckout />
						</EmbeddedCheckoutProvider>
					</div>
				</div>
			)}
		</>
	);
}
