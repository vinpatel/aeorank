import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "100vh",
				background: "var(--bg)",
				flexDirection: "column",
				gap: "32px",
				padding: "40px 20px",
			}}
		>
			<div style={{ textAlign: "center" }}>
				<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
					<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
						<rect width="32" height="32" rx="7" fill="#E8590C"/>
						<path d="M8 22L13.5 10H18.5L24 22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
						<path d="M10.5 18H21.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
					</svg>
					<span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "22px", letterSpacing: "-0.02em" }}>
						AEOrank
					</span>
				</div>
				<p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
					Monitor and improve your AI visibility score
				</p>
			</div>
			<SignIn
				appearance={{
					variables: {
						colorPrimary: "#E8590C",
						borderRadius: "8px",
					},
				}}
			/>
		</div>
	);
}
