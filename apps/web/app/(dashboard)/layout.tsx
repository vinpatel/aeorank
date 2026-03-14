import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { userId } = await auth();
	if (!userId) {
		redirect("/sign-in");
	}

	return (
		<div style={{ display: "flex", minHeight: "100vh" }}>
			<nav
				style={{
					width: "200px",
					borderRight: "1px solid #e5e7eb",
					padding: "24px 16px",
					display: "flex",
					flexDirection: "column",
					gap: "8px",
				}}
			>
				<Link
					href="/dashboard"
					style={{ padding: "8px", textDecoration: "none", color: "#111" }}
				>
					Dashboard
				</Link>
				<Link
					href="/upgrade"
					style={{ padding: "8px", textDecoration: "none", color: "#111" }}
				>
					Upgrade
				</Link>
			</nav>
			<main style={{ flex: 1, padding: "24px" }}>{children}</main>
		</div>
	);
}
