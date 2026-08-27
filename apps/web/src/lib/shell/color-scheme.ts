export type ColorSchemePreference = "light" | "dark" | "system";

export const COLOR_SCHEME_OPTIONS = [
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
	{ value: "system", label: "System" },
] as const satisfies ReadonlyArray<{ value: ColorSchemePreference; label: string }>;

export type QualmsTheme = "qualms" | "qualms-dark";

export const COLOR_SCHEME_STORAGE_KEY = "qualms.color-scheme";

export const LIGHT_THEME = "qualms";

export const DARK_THEME = "qualms-dark";

export function isColorSchemePreference(value: string | null): value is ColorSchemePreference {
	return value === "light" || value === "dark" || value === "system";
}

export function readColorSchemePreference(): ColorSchemePreference {
	const value = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
	return isColorSchemePreference(value) ? value : "light";
}

export function writeColorSchemePreference(preference: ColorSchemePreference): void {
	localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, preference);
}

export function resolveTheme(
	preference: ColorSchemePreference,
	darkOs: boolean,
): QualmsTheme {
	if (preference === "dark" || (preference === "system" && darkOs)) return DARK_THEME;
	return LIGHT_THEME;
}

export function applyTheme(theme: QualmsTheme): void {
	document.documentElement.dataset.theme = theme;
}

export function prefersDarkOs(): boolean {
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function syncDocumentTheme(preference: ColorSchemePreference): void {
	applyTheme(resolveTheme(preference, prefersDarkOs()));
}
