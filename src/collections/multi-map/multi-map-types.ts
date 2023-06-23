import { TrimDir } from '../../primitives/string/trimming.js';


/** How to render a `MultiMap` into a `string`. */
export type MultiMapRendering<T> = MultiMapSeparators & {
	/**
	 * The transformation from `T` to `string`.
	 *
	 * Will do string coercion by default.
	 */
	transform?: (val: T) => string,
};

/** How to trim each part of the `input` parsed into a `MultiMap`. */
export type MultiMapTrim = {
	/** How to trim the whole `input`? */
	input?: TrimDir,
	/** How to trim each `entry`? */
	entries?: TrimDir,
	/** How to trim each of the `keys`? */
	keys?: TrimDir,
	/** How to trim each of the `values`? */
	values?: TrimDir,
};

/** How to parse the `input` into a `MultiMap`. */
export type MultiMapParsing<T> = MultiMapSeparators & {
	/**
	 * The transformation from `string` to `T`
	 */
	transform?: (str: string) => T,
	/**
	 * What trimming, if any to apply to various parsed parts.
	 *
	 * The defaults are tailored to work well for when you've created the `input` in a template literal:
	 * ```typescript
	 * {
	 * 	input:   'both',
	 * 	entries: 'start',
	 * 	keys:    'none',
	 * 	values:  'none',
	 * }
	 * ```
	 *
	 * If you don't want any trimming, use `'none'` instead.
	 */
	trim?: TrimDir | MultiMapTrim,
};

/**
 * The separator for each entry, which represents `Kvp`s.
 *
 * The defaults were chosen so that the string-representation of a `MultiMap`
 * is easy for a human to read and write using template literals.
 */
export type MultiMapSeparators = {
	/** The separator for each entry, which represent a `Kvp`. Default: `'\n'`. */
	entry?: string,
	/** The separator between the entry key and entry values. Default: `':'`. */
	keyValue?: string,
	/** The separator between each entry value. Default: `','`. */
	value?: string,
};
