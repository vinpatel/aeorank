import { AeorankMark } from "@/components/AeorankMark";
import type { ReactNode } from "react";

export function AuthPageShell({
	children,
	subtitle = "Score your site. Download the 8 files. Ship the fixes.",
}: {
	children: ReactNode;
	subtitle?: string;
}) {
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
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "10px",
						marginBottom: "12px",
					}}
				>
					<AeorankMark size={32} />
					<span
						style={{
							fontFamily: "var(--font-display)",
							fontWeight: 700,
							fontSize: "22px",
							letterSpacing: "-0.02em",
						}}
					>
						AEOrank
					</span>
				</div>
				<p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>{subtitle}</p>
				<p
					style={{
						margin: "12px 0 0",
						fontFamily: "var(--font-mono)",
						fontSize: "11px",
						color: "var(--text-muted)",
						letterSpacing: "0.02em",
					}}
				>
					MIT · CLI free · CI gate · 8 files
				</p>
			</div>
			{children}
		</div>
	);
}
