import dynamic from "next/dynamic";

const ClerkSignIn = dynamic(() => import("@/components/auth/ClerkAuthWidgets").then((mod) => mod.ClerkSignIn), {
  ssr: false
});

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <section className="grid min-h-[calc(100svh-4rem)] place-items-center px-4 text-text-secondary">Add Clerk keys to enable sign-in.</section>;
  }

  return (
    <section className="grid min-h-[calc(100svh-4rem)] place-items-center px-4">
      <ClerkSignIn />
    </section>
  );
}
