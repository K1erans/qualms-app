import type { AccountIdentity, OrganizationKind } from "./types";

export type AuthProfile = {
	email: string;
	firstName: string | null;
	lastName: string | null;
};

export type DerivedAccountProfile = {
	displayName: string;
	handle: string;
	cachedName: string | null;
	workspaceName: string;
};

function trimmedName(value: string | null): string | null {
	const trimmed = value?.trim() ?? "";
	return trimmed === "" ? null : trimmed;
}

export function deriveAccountProfile(profile: AuthProfile): DerivedAccountProfile {
	const handle = profile.email.split("@")[0] ?? profile.email;
	const names = [trimmedName(profile.firstName), trimmedName(profile.lastName)].filter(
		(part): part is string => part !== null,
	);
	const cachedName = names.length === 0 ? null : names.join(" ");
	const displayName = cachedName ?? handle;

	return {
		displayName,
		handle,
		cachedName,
		workspaceName: `${displayName}'s workspace`,
	};
}

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
