import type { AuthKitAuth, User } from "@workos/authkit-sveltekit";
import type { AccountIdentity } from "$lib/shell/types";
import type { Sql } from "$lib/server/db";
import type { ProvisionedAccount } from "$lib/server/account";

declare global {
	namespace App {
		interface Locals {
			auth: AuthKitAuth;
			sql?: Sql;
			account?: ProvisionedAccount;
		}
		interface PageData {
			user: User | null;
			identity: AccountIdentity | null;
		}
		interface Platform {
			env: Env;
			ctx?: {
				waitUntil(promise: Promise<unknown>): void;
			};
		}
	}
}

export {};
