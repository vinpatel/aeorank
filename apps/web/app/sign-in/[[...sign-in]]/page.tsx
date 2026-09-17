import { AuthPageShell } from "@/components/AuthPageShell";
import { afterAuthPath, parsePaidPlanSlug } from "@/lib/checkout-plan";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const clerkAppearance = {
	variables: {
		colorPrimary: "#E8590C",
		borderRadius: "8px",
	},
};

export default async function SignInPage({
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
				plan ? "Sign in to continue to checkout" : "Score crawler access. Get the 8 files."
			}
		>
			<SignIn
				forceRedirectUrl={plan ? after : undefined}
				fallbackRedirectUrl={after}
				signUpUrl={plan ? `/sign-up?plan=${plan}` : "/sign-up"}
				appearance={clerkAppearance}
			/>
		</AuthPageShell>
	);
}
