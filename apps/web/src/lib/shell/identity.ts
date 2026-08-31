import { deriveAccountProfile, type AuthProfile } from "@qualms/core";
import type { AccountIdentity, OrganizationKind } from "./types";

export function identityFromAuthUser(
	user: AuthProfile,
	organisationName: string,
	organizationKind: OrganizationKind,
): AccountIdentity {
	const profile = deriveAccountProfile(user);
	return {
		displayName: profile.displayName,
		handle: profile.handle,
		email: user.email,
		organization: organisationName,
		organizationKind,
	};
}
