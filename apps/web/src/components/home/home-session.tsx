import { GithubSignInForm } from "@/components/auth/github-sign-in-form";
import { SignOutForm } from "@/components/auth/sign-out-form";
import { isGithubOAuthConfigured } from "@/lib/github-oauth";
import { getSignedInUser } from "@/lib/session";

export async function HomeSession() {
  const user = await getSignedInUser();

  if (user) {
    return (
      <section>
        <p>Signed in as {user.displayName}</p>
        <SignOutForm />
      </section>
    );
  }

  return isGithubOAuthConfigured() ? (
    <section>
      <GithubSignInForm />
    </section>
  ) : (
    <section>
      <p>
        GitHub OAuth is not configured. Create a GitHub OAuth App and add{" "}
        <code>AUTH_GITHUB_ID</code> and <code>AUTH_GITHUB_SECRET</code> to{" "}
        <code>apps/web/.env.local</code>. See <code>.env.example</code>.
      </p>
    </section>
  );
}
