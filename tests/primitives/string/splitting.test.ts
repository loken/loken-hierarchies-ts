import { describe, expect, it } from 'vitest';

import { splitBy, splitKvp } from '../../../src/primitives/string/splitting.js';


describe('splitBy', () => {
	it('should split by default separators by default', () => {
		const parts = splitBy('A|B|C');

		expect(parts).toEqual([ 'A', 'B', 'C' ]);
	});

	it('should split by provided separators', () => {
		const parts = splitBy('A-B&C', { sep: [ '-', '&' ] });

		expect(parts).toEqual([ 'A', 'B', 'C' ]);
	});

	it('should split by provided separators that has a special meaning in regex', () => {
		const parts = splitBy('A^B$C', { sep: [ '^', '$' ] });

		expect(parts).toEqual([ 'A', 'B', 'C' ]);
	});

	it('should split by provided separators that are more than 1 in length', () => {
		const parts = splitBy('A::B<something>C', { sep: [ '::', '<something>' ] });

		expect(parts).toEqual([ 'A', 'B', 'C' ]);
	});

	it('should remove empty strings by default', () => {
		const parts = splitBy('A||B|C');

		expect(parts).toEqual([ 'A', 'B', 'C' ]);
	});

	it('should be able to trim the results', () => {
		const source = ' A|B | C ';

		expect(splitBy(source, { sep: '|', trim: 'start' })).toEqual([ 'A', 'B ', 'C ' ]);
		expect(splitBy(source, { sep: '|', trim: 'end' })).toEqual([ ' A', 'B', ' C' ]);
		expect(splitBy(source, { sep: '|', trim: 'both' })).toEqual([ 'A', 'B', 'C' ]);
	});
});

describe('splitKvp', () => {
	it('should split into a tuple', () => {
		const kvp = splitKvp('Key|Value');

		expect(kvp).toEqual([ 'Key', 'Value' ]);
	});

	it('should split into a tuple of 2 even when it could split into more parts', () => {
		const kvp = splitKvp('Key|Value|With|Extras');

		// NB! Note that this behavior is different than in .NET,
		// which would have used "Value|With|Extras" as the value.
		expect(kvp).toEqual([ 'Key', 'Value' ]);
	});

	it('should yield a value of `null` when there is no separator', () => {
		const kvp = splitKvp('Key');

		expect(kvp).toEqual([ 'Key', null ]);
	});

	it('should yield an empty key when there are no segments', () => {
		const kvp = splitKvp('');

		expect(kvp).toEqual([ '', null ]);
	});
});
