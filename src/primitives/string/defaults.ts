import { Multiple, spreadMultiple } from '../../collections/iteration/multiple.js';


/**
 * Defaults for use in various string/text operations.
 */
export class StringDefaults {

	/** Block instantiation by making the ctor private to simulate a static class. */
	private constructor() {}

	/**
	 * Separators that will be used by features that need some default separator characters.
	 *
	 * You may want to modify this set at startup if you need other defaults.
	 */
	public static readonly separators = new Set([ ':', ';', ',', '|' ]);

	/**
	 * When some `separators` are provided as an arg, return them, otherwise return the defaults.
	 * @param separators Optional separators to use instead of the defaults.
	 */
	public static getSeparators(separators?: Multiple<string>): string[] {
		return separators !== undefined
			? spreadMultiple(separators)
			: [ ...StringDefaults.separators ];
	}

}
