"use client";

import { SignIn, SignUp } from "@clerk/nextjs";

export function ClerkSignIn() {
  return <SignIn />;
}

export function ClerkSignUp() {
  return <SignUp />;
}
