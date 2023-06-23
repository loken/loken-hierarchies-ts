import { splitBy, splitKvp } from '../../primitives/string/splitting.js';
import { getTrim, trimBy } from '../../primitives/string/trimming.js';
import { iterateMultiple, Multiple } from '../iteration/multiple.js';
import { mapGetLazy } from '../map.js';
import { MultiMapParsing, MultiMapRendering, MultiMapSeparators, MultiMapTrim } from './multi-map-types.js';


/**
 * A Map of values to sets of values.
 */
export class MultiMap<T = string> extends Map<T, Set<T>> {

	//#region set management.
	/**
	 * Add one or more `values` to the set at the `key`.
	 *
	 * Will create and add the `Set` to the `Map` if it doesn't already exist.
	 * @param key The map key.
	 * @param values The values to add.
	 * @returns The number of values that were added.
	 */
	public add(key: T, values: Multiple<T>): number {
		const set = mapGetLazy(this, key, () => new Set<T>());

		let count = 0;

		for (let value of iterateMultiple(values)) {
			set.add(value);
			count++;
		}

		return count;
	}

	/**
	 * Remove one ore more `values` from the set ata the `key`.
	 *
	 * Will delete the `Set` from the `Map` if it ends up empty after removing the `values`.
	 * @param key The map key.
	 * @param values The values to remove.
	 * @returns The subset of `values` that were previously in the `Set`.
	 */
	public remove(key: T, values: Multiple<T>): T[] {
		const set = mapGetLazy(this, key, () => new Set<T>());

		const removed = [];

		for (let value of iterateMultiple(values)) {
			if (set.delete(value))
				removed.push(value);
		}

		if (set.size === 0)
			this.delete(key);

		return removed;
	}
	//#endregion

	//#region serialization
	/**
	 * Parse the `input` into the existing `MultiMap`.
	 *
	 * If you want to obtain a `MultiMap` of something which isn't a string, you must provide a `transform`.
	 *
	 * @param input The string to parse.
	 * @param options How to parse the `input` into a `MultiMap`.
	 */
	public parse(input: string, options?: MultiMapParsing<T>): this {
		const sep = MultiMap.getSeparators(options);
		const trim: Required<MultiMapTrim> = {
			input:   getTrim('input',   options?.trim, 'both'),
			entries: getTrim('entries', options?.trim, 'start'),
			keys:    getTrim('keys',    options?.trim, 'none'),
			values:  getTrim('values',  options?.trim, 'none'),
		};

		input = trimBy(input, trim.input);

		const lines = splitBy(input, {
			sep:  sep.entry,
			trim: trim.entries,
		});

		for (let line of lines) {
			let [ rawKey, rawValue ] = splitKvp(line, { sep: sep.keyValue });
			if (rawValue === null)
				continue;

			rawKey = trimBy(rawKey, trim.keys);

			let key = options?.transform?.(rawKey) ?? (rawKey as T);
			let values = splitBy(rawValue, { sep: sep.value }).map(value => {
				let v = trimBy(value, trim.values);

				return options?.transform?.(v) ?? (v as T);
			});

			for (let value of values)
				this.add(key, value);
		}

		return this;
	}

	/**
	 * Render into a `string`.
	 *
	 * If you provide a `transform` it will be used instead of string-coercion for transforming `T`s into `string`s.
	 */
	public render(options?: MultiMapRendering<T>): string {
		const sep = MultiMap.getSeparators(options);

		const entries: string[] = [];

		for (let [ rawKey, rawValues ] of this.entries()) {
			const key = options?.transform?.(rawKey) ?? rawKey;
			const values: string = [ ...rawValues ].map(v => options?.transform?.(v) ?? v).join(sep.value);
			const entry = `${ key }${ sep.keyValue }${ values }`;

			entries.push(entry);
		}

		return entries.join(sep.entry);
	}

	/**
	 * Parse the `input` into a `MultiMap`.
	 *
	 * If you want to obtain a `MultiMap` of something which isn't a string, you must provide a `transform`.
	 *
	 * @param input The string to parse.
	 * @param options How to parse the `input` into a `MultiMap`.
	 */
	public static parse = <T = string>(input: string, options?: MultiMapParsing<T>): MultiMap<T> => {
		return new MultiMap<T>().parse(input, options);
	};

	/**
	 * Render the `multiMap` into a `string`.
	 *
	 * If you provide a `transform` it will be used instead of string-coercion for transforming `T`s into `string`s.
	 */
	public static render<T>(multiMap: MultiMap<T>, options?: MultiMapRendering<T>): string {
		return multiMap.render(options);
	}
	//#endregion

	/** The default values for `MultiMapSeparators`. */
	public static readonly defaultSeparators: Required<MultiMapSeparators> = Object.freeze({
		entry:    '\n',
		keyValue: ':',
		value:    ',',
	});

	/** Create `MultiMapSeparators` from the `separators` and `defaultSeparators`. */
	public static getSeparators(separators?: MultiMapSeparators) {
		return {
			...MultiMap.defaultSeparators,
			...separators,
		};
	}

}
