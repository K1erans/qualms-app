function messageForError(error: string) {
  switch (error) {
    case "Configuration":
      return "GitHub OAuth is missing or invalid. Check AUTH_GITHUB_ID and AUTH_GITHUB_SECRET in apps/web/.env.local.";
    case "AccessDenied":
      return "GitHub denied access.";
    case "Verification":
      return "The sign-in link is no longer valid.";
    default:
      return "Something went wrong during GitHub sign-in.";
  }
}

export default async function AuthErrorPage({
  searchParams,
}: PageProps<"/auth/error">) {
  const params = await searchParams;
  const errorValue = params.error;
  const error = Array.isArray(errorValue) ? errorValue[0] : errorValue;

  return (
    <main>
      <h1>Sign-in failed</h1>
      <p>{messageForError(error ?? "Unknown")}</p>
      <a href="/">Back home</a>
    </main>
  );
}
