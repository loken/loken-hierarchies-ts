import { splitBy, SplitOptions } from './splitting.js';
import { trimBy, TrimDir } from './trimming.js';


/** How to trim each part of the `input` as `lines`? */
export type LinesTrim = {
	/** How to trim the whole `input`? */
	input?: TrimDir,
	/** How to trim each of the `lines`? */
	lines?: TrimDir,
};


/**
 *  Split the `input` on '\n' and otherwise according to the provided `options`.
 */
export const splitLines = (input: string, options?: Omit<SplitOptions, 'sep' | 'trim'> & LinesTrim): string[] => {
	const trimmedInput = trimBy(input, options?.input);

	return splitBy(trimmedInput, { ...options, sep: '\n', trim: options?.lines });
};

/** Trim the `input` and its lines according to the `direction` and remove any empty lines. */
export const trimLines = (input: string, direction: TrimDir | {input: TrimDir, lines: TrimDir} = { input: 'both', lines: 'start' }) => {
	const trim: LinesTrim = {
		input: typeof direction === 'string' ? direction : direction.input,
		lines: typeof direction === 'string' ? direction : direction.lines,
	};

	const lines = splitLines(input, trim);

	return lines.join('\n');
};
