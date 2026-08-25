"use client";

import { useFormStatus } from "react-dom";
import { signInWithGithub } from "@/actions/auth";

function GithubSignInSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Redirecting to GitHub…" : "Sign in with GitHub"}
    </button>
  );
}

export function GithubSignInForm() {
  return (
    <form action={signInWithGithub}>
      <GithubSignInSubmitButton />
    </form>
  );
}
