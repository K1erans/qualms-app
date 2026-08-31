import { identityFromAuthUser } from "$lib/shell/identity";
import { ensureAccount } from "$lib/server/account";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
	const user = event.locals.auth?.user ?? null;
	if (!user) {
		return {
			user: null,
			identity: null,
		};
	}

	const account = await ensureAccount(event);
	if (!account) {
		throw new Error("Signed-in user could not be provisioned");
	}

	return {
		user,
		identity: identityFromAuthUser(user, account.organisationName),
	};
};
