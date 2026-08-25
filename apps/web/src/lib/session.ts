import { cache } from "react";
import { auth } from "@/lib/auth";

export const getSession = cache(() => auth());

export const getSignedInUser = cache(async () => {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return null;
  }

  return {
    displayName: user.name ?? user.email ?? "GitHub user",
  };
});
