import assert from "node:assert/strict";
import { test } from "node:test";

import { dayGroup, formatCompactTime } from "./time.ts";

const NOW = Date.parse("2026-08-25T18:30:00.000Z");

test("formatCompactTime rounds to the largest whole unit", () => {
	assert.equal(formatCompactTime("2026-08-25T18:29:40.000Z", NOW), "just now");
	assert.equal(formatCompactTime("2026-08-25T18:25:00.000Z", NOW), "5m ago");
	assert.equal(formatCompactTime("2026-08-25T16:10:00.000Z", NOW), "2h ago");
	assert.equal(formatCompactTime("2026-08-22T08:00:00.000Z", NOW), "3d ago");
	assert.equal(formatCompactTime("2026-06-01T08:00:00.000Z", NOW), "3mo ago");
});

test("formatCompactTime treats future timestamps as just now", () => {
	assert.equal(formatCompactTime("2026-08-25T19:00:00.000Z", NOW), "just now");
});

test("formatCompactTime returns unparseable input unchanged", () => {
	assert.equal(formatCompactTime("not a date", NOW), "not a date");
});

test("dayGroup buckets by calendar day, not elapsed hours", () => {
	const noon = Date.parse("2026-08-25T12:00:00.000Z");
	assert.equal(dayGroup("2026-08-25T11:00:00.000Z", noon), "Today");
	assert.equal(dayGroup("2026-08-24T12:00:00.000Z", noon), "Yesterday");
	assert.equal(dayGroup("2026-08-21T12:00:00.000Z", noon), "Previous 7 days");
	assert.equal(dayGroup("2026-08-18T12:00:00.000Z", noon), "Older");
	assert.equal(dayGroup("garbage", noon), "Older");
});
