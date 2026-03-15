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

/**
 * Client component that triggers Stripe Embedded Checkout.
 * Calls the createCheckoutSession server action to get a clientSecret,
 * then renders the EmbeddedCheckout modal using @stripe/react-stripe-js.
 */
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
				style={{
					width: "100%",
					padding: "11px 20px",
					backgroundColor: "var(--bg-accent)",
					color: "#fff",
					border: "none",
					borderRadius: "var(--radius-sm)",
					fontSize: "14px",
					fontWeight: 600,
					fontFamily: "inherit",
					cursor: isLoading ? "not-allowed" : "pointer",
					opacity: isLoading ? 0.7 : 1,
					transition: "background 0.15s ease, opacity 0.15s ease",
				}}
			>
				{isLoading ? "Loading..." : label}
			</button>
			{error && (
				<p style={{ color: "var(--red)", fontSize: "13px", marginTop: "8px" }}>
					{error}
				</p>
			)}
			{isOpen && clientSecret && (
				<div
					style={{
						position: "fixed",
						inset: 0,
						backgroundColor: "rgba(0,0,0,0.5)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 1000,
					}}
					onClick={handleClose}
				>
					<div
						style={{
							backgroundColor: "#fff",
							borderRadius: "12px",
							padding: "24px",
							width: "100%",
							maxWidth: "480px",
							maxHeight: "90vh",
							overflowY: "auto",
							position: "relative",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<button
							type="button"
							onClick={handleClose}
							style={{
								position: "absolute",
								top: "12px",
								right: "12px",
								background: "none",
								border: "none",
								fontSize: "20px",
								cursor: "pointer",
								color: "#6b7280",
							}}
							aria-label="Close checkout"
						>
							x
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
