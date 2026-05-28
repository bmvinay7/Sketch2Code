import { ClerkSignUp } from "@/components/auth/ClerkAuthWidgets";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <section className="grid min-h-[calc(100svh-4rem)] place-items-center px-4 text-paper-200">
        Add Clerk keys to enable sign-up.
      </section>
    );
  }
  return (
    <section className="grid min-h-[calc(100svh-4rem)] place-items-center px-4">
      <ClerkSignUp />
    </section>
  );
}
