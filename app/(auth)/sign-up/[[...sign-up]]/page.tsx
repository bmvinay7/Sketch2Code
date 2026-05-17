import nextDynamic from "next/dynamic";

const ClerkSignUp = nextDynamic(() => import("@/components/auth/ClerkAuthWidgets").then((mod) => mod.ClerkSignUp), {
  ssr: false
});

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <section className="grid min-h-[calc(100svh-4rem)] place-items-center px-4 text-text-secondary">Add Clerk keys to enable sign-up.</section>;
  }

  return (
    <section className="grid min-h-[calc(100svh-4rem)] place-items-center px-4">
      <ClerkSignUp />
    </section>
  );
}
