import { resolveValueProvider, ValueProvider } from '../utilities/value-provider.js';


/**
 * Get a `TValue` from the `map`, and add it first if it doesn't already exist in the map.
 * @param map - The map containing values.
 * @param key - The key to use when retrieving a value.
 * @param def - The provider of a value to use when the key does not already exist in the map.
 * @param retrieveAction - An optional action to perform on the value when it already exists in the map.
 */
export const mapGetLazy = <TKey, TValue>(
	map: Map<TKey, TValue>,
	key: TKey,
	def: ValueProvider<TValue>,
	retrieveAction?: (value: TValue) => void,
) => {
	if (map.has(key)) {
		const val = map.get(key)!;
		retrieveAction?.(val);

		return val;
	}

	const val: TValue = resolveValueProvider(def);

	map.set(key, val);

	return val;
};
