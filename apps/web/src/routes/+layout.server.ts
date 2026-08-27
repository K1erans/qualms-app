import { identityFromAuthUser } from "$lib/shell/identity";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.auth?.user ?? null;

	return {
		user,
		identity: user ? identityFromAuthUser(user) : null,
	};
};
