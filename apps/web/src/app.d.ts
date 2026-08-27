import type { AuthKitAuth, User } from "@workos/authkit-sveltekit";
import type { AccountIdentity } from "$lib/shell/types";

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: AuthKitAuth;
		}
		interface PageData {
			user: User | null;
			identity: AccountIdentity | null;
		}
		// interface PageState {}
		interface Platform {
			env: Env;
		}
	}
}

export {};
