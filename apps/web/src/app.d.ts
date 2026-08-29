import type { AuthKitAuth, User } from "@workos/authkit-sveltekit";
import type { AccountIdentity } from "$lib/shell/types";

declare global {
	namespace App {
		interface Locals {
			auth: AuthKitAuth;
		}
		interface PageData {
			user: User | null;
			identity: AccountIdentity | null;
		}
		interface Platform {
			env: Env;
		}
	}
}

export {};
