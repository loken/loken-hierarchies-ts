/**
 * Generate a sequence of numbers.
 * @param start The first value in the sequence.
 * @param count The number of values to generate.
 */
export function* traverseRange(start: number, count: number) {
	let current = start;
	while (count-- > 0)
		yield current++;
}

/**
 * Create an array containing a range of numbers.
 * @param start The first value in the array.
 * @param count The number of values to add.
 */
export const range = (start: number, count: number) => {
	return [ ...traverseRange(start, count) ];
};
