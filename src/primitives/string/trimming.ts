/** The direction in which to trim. */
export type TrimDir = 'start' | 'end' | 'both' | 'none';


/**
 * Trim the `str` in the indicated `direction` or pass it through if none is provided.
 */
export const trimBy = (str: string, direction?: TrimDir) => {
	switch (direction) {
	case 'start':
		return str.trimStart();
	case 'end':
		return str.trimEnd();
	case 'both':
		return str.trim();
	default:
		return str;
	}
};


/**
 * Get the `TrimDir` for the `setting` from the `settings` or provide the `fallback` as a default.
 */
export const getTrim = <TrimSettings extends Record<string, TrimDir>>(
	setting:   keyof TrimSettings,
	settings?: TrimDir | TrimSettings,
	fallback:  TrimDir = 'none',
): TrimDir => {
	return typeof settings === 'object'
		? settings[setting] ?? fallback
		: settings ?? fallback;
};
