"use client";

import { useFormStatus } from "react-dom";
import { signOutCurrentUser } from "@/actions/auth";

function SignOutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function SignOutForm() {
  return (
    <form action={signOutCurrentUser}>
      <SignOutSubmitButton />
    </form>
  );
}
