import { ClerkSignIn } from "@/components/auth/ClerkAuthWidgets";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <section className="grid min-h-[calc(100svh-4rem)] place-items-center px-4 text-paper-200">
        Add Clerk keys to enable sign-in.
      </section>
    );
  }
  return (
    <section className="grid min-h-[calc(100svh-4rem)] place-items-center px-4">
      <ClerkSignIn />
    </section>
  );
}
