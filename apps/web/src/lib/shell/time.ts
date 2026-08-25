import type { RunOutcome, RunTrigger } from "./types";

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeTime(iso: string, nowMs: number): string {
	const then = Date.parse(iso);
	if (Number.isNaN(then)) return iso;

	const deltaSec = Math.round((then - nowMs) / 1000);
	const abs = Math.abs(deltaSec);
	const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

	if (abs < MINUTE) return formatter.format(deltaSec, "second");
	if (abs < HOUR) return formatter.format(Math.round(deltaSec / MINUTE), "minute");
	if (abs < DAY) return formatter.format(Math.round(deltaSec / HOUR), "hour");
	if (abs < 30 * DAY) return formatter.format(Math.round(deltaSec / DAY), "day");
	return formatter.format(Math.round(deltaSec / (30 * DAY)), "month");
}

export function formatTrigger(trigger: RunTrigger): string {
	return trigger === "app" ? "App" : "CI";
}

export function formatOutcome(outcome: RunOutcome): string {
	return outcome === "passed" ? "Passed" : "Failed";
}
