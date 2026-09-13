import { AuthPageShell } from "@/components/AuthPageShell";
import { afterAuthPath, parsePaidPlanSlug } from "@/lib/checkout-plan";
import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const clerkAppearance = {
	variables: {
		colorPrimary: "#E8590C",
		borderRadius: "8px",
	},
};

export default async function SignUpPage({
	searchParams,
}: {
	searchParams: Promise<{ plan?: string }>;
}) {
	const params = await searchParams;
	const plan = parsePaidPlanSlug(params.plan);
	const after = afterAuthPath(plan);

	const { userId } = await auth();
	if (userId) {
		redirect(after);
	}

	return (
		<AuthPageShell
			subtitle={
				plan === "pro"
					? "Create your account to start Pro ($29/mo)"
					: plan === "agency"
						? "Create your account to start Agency ($99/mo)"
						: "Monitor and improve your AI visibility score"
			}
		>
			<SignUp
				forceRedirectUrl={after}
				fallbackRedirectUrl={after}
				signInUrl={plan ? `/sign-in?plan=${plan}` : "/sign-in"}
				appearance={clerkAppearance}
			/>
		</AuthPageShell>
	);
}
