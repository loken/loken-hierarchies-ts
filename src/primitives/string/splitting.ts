
import { Multiple } from '../../collections/iteration/multiple.js';
import { StringDefaults } from './defaults.js';
import { escapeRegex } from './regex.js';
import { trimBy, TrimDir } from './trimming.js';


/** A tuple of a key and a value. */
export type Kvp<K, V = K> = readonly [key: K, value: V | null];

/** Describes how to split a string. */
export type SplitOptions = {
	/** One or more separators to use. Default: `DefaultStrings.separators` */
	sep?: Multiple<string>,
	/** Should we `'keep'` or `'remove'` empty strings? Default: `'remove'`. */
	empty?: 'keep' | 'remove',
	/** Should we trim each returned segment? (Default: No trimming.) */
	trim?: TrimDir,
	/** The maximum number of segments to keep when splitting. This is prior to filtering empty segments! */
	max?: number,
}


/**
 *  Split the `str` according to the provided `options`.
 */
export const splitBy = (str: string, options?: SplitOptions): string[] => {
	const sep = StringDefaults.getSeparators(options?.sep);
	const exp = new RegExp(sep.map(escapeRegex).join('|'), 'gi');

	let parts = str.split(exp, options?.max);
	if (options?.trim)
		parts = parts.map(p => trimBy(p, options.trim));

	if (options?.empty !== 'keep')
		parts = parts.filter(s => s.length !== 0);

	return parts;
};

/**
 * Split the `str` into a maximum of 2 segments and according to the provided `options`.
 *
 * Then make a `Kvp` of the segments where they `key` defaults to `''` and the `value` defaults to `null`
 */
export const splitKvp = (str: string, options?: Omit<SplitOptions, 'max'>): Kvp<string> => {
	const [ key, value ] = splitBy(str, { ...options, max: 2 });

	return [ key ?? '', value ?? null ];
};
