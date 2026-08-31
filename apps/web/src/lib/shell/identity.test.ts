import assert from "node:assert/strict";
import { test } from "node:test";
import { deriveAccountProfile, identityFromAuthUser } from "./identity.ts";

test("uses first and last name for display, cache, and workspace", () => {
	assert.deepEqual(
		deriveAccountProfile({
			email: "ada@example.com",
			firstName: "Ada",
			lastName: "Lovelace",
		}),
		{
			displayName: "Ada Lovelace",
			handle: "ada",
			cachedName: "Ada Lovelace",
			workspaceName: "Ada Lovelace's workspace",
		},
	);
});

test("falls back to the email handle when both names are null", () => {
	assert.deepEqual(
		deriveAccountProfile({
			email: "kieran@example.com",
			firstName: null,
			lastName: null,
		}),
		{
			displayName: "kieran",
			handle: "kieran",
			cachedName: null,
			workspaceName: "kieran's workspace",
		},
	);
});

test("treats blank names as absent", () => {
	assert.deepEqual(
		deriveAccountProfile({
			email: "kieran@example.com",
			firstName: "  ",
			lastName: "",
		}),
		{
			displayName: "kieran",
			handle: "kieran",
			cachedName: null,
			workspaceName: "kieran's workspace",
		},
	);
});

test("uses a first name only when the last name is missing", () => {
	assert.deepEqual(
		deriveAccountProfile({
			email: "ada@example.com",
			firstName: "Ada",
			lastName: null,
		}),
		{
			displayName: "Ada",
			handle: "ada",
			cachedName: "Ada",
			workspaceName: "Ada's workspace",
		},
	);
});

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
