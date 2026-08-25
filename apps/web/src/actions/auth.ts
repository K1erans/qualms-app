"use server";

import { auth, signIn, signOut } from "@/lib/auth";
import { isGithubOAuthConfigured } from "@/lib/github-oauth";

export async function signInWithGithub() {
  if (!isGithubOAuthConfigured()) {
    throw new Error(
      "GitHub OAuth is not configured. Set AUTH_GITHUB_ID and AUTH_GITHUB_SECRET in apps/web/.env.local.",
    );
  }

  await signIn("github", { redirectTo: "/" });
}

export async function signOutCurrentUser() {
  const session = await auth();

  if (!session) {
    return;
  }

  await signOut({ redirectTo: "/" });
}
