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

export function formatCompactTime(iso: string, nowMs: number): string {
	const then = Date.parse(iso);
	if (Number.isNaN(then)) return iso;

	const ago = Math.round((nowMs - then) / 1000);
	if (ago < MINUTE) return "just now";
	if (ago < HOUR) return `${Math.round(ago / MINUTE)}m ago`;
	if (ago < DAY) return `${Math.round(ago / HOUR)}h ago`;
	if (ago < 30 * DAY) return `${Math.round(ago / DAY)}d ago`;
	return `${Math.round(ago / (30 * DAY))}mo ago`;
}

export type DayGroup = "Today" | "Yesterday" | "Previous 7 days" | "Older";

export const DAY_GROUP_ORDER: readonly DayGroup[] = ["Today", "Yesterday", "Previous 7 days", "Older"];

function localDayIndex(ms: number): number {
	const date = new Date(ms);
	return Math.floor(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / (DAY * 1000),
	);
}

export function dayGroup(iso: string, nowMs: number): DayGroup {
	const then = Date.parse(iso);
	if (Number.isNaN(then)) return "Older";
	const days = localDayIndex(nowMs) - localDayIndex(then);
	if (days <= 0) return "Today";
	if (days === 1) return "Yesterday";
	if (days < 7) return "Previous 7 days";
	return "Older";
}

export function formatTrigger(trigger: RunTrigger): string {
	return trigger === "app" ? "App" : "CI";
}

export function formatOutcome(outcome: RunOutcome): string {
	return outcome === "passed" ? "Passed" : "Failed";
}
