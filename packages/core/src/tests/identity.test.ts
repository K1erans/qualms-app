import assert from "node:assert/strict";
import { test } from "node:test";
import { deriveAccountProfile } from "../identity.ts";

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
