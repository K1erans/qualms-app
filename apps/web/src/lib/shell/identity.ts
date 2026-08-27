import type { AccountIdentity } from "./types";

export function identityFromAuthUser(user: {
	email: string;
	firstName: string | null;
	lastName: string | null;
}): AccountIdentity {
	const displayName = [user.firstName, user.lastName]
		.filter((part): part is string => Boolean(part?.trim()))
		.join(" ");
	const handle = user.email.split("@")[0] ?? user.email;

	return {
		displayName: displayName || handle,
		handle,
		email: user.email,
		organization: "Not linked",
	};
}
