import assert from "node:assert/strict";
import { test } from "node:test";
import { identityFromAuthUser } from "./identity.ts";

const user = {
	email: "ada@example.com",
	firstName: "Ada",
	lastName: "Lovelace",
};

test("uses a personal organisation kind when the account is personal", () => {
	assert.deepEqual(identityFromAuthUser(user, "Ada Lovelace's workspace", "personal"), {
		displayName: "Ada Lovelace",
		handle: "ada",
		email: "ada@example.com",
		organization: "Ada Lovelace's workspace",
		organizationKind: "personal",
	});
});

test("uses an organisation kind when the account is an organisation", () => {
	assert.deepEqual(identityFromAuthUser(user, "Acme", "organisation"), {
		displayName: "Ada Lovelace",
		handle: "ada",
		email: "ada@example.com",
		organization: "Acme",
		organizationKind: "organisation",
	});
});
