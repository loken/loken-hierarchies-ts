import { describe, expect, it } from 'vitest';

import { iterateMultiple, spreadMultiple } from '../../../src/collections/iteration/multiple.js';

describe('iterateMultiple', () => {
	it('should iterate a single item', () => {
		const item = { a: 1 };
		const result = [ ...iterateMultiple(item) ];

		expect(result).toEqual([ item ]);
	});

	it('should iterate an array of items', () => {
		const items = [ { a: 1 }, { a: 2 } ];
		const result = [ ...iterateMultiple(items) ];

		expect(result).toEqual(items);
	});

	it('should iterate an item generator', () => {
		function* generateItems() {
			yield { a: 1 };
			yield { a: 2 };
		}

		const result = [ ...iterateMultiple(generateItems()) ];

		expect(result).toEqual([ { a: 1 }, { a: 2 } ]);
	});
});

describe('spreadMultiple', () => {
	it('should wrap a single item', () => {
		const item = { a: 1 };
		const result = spreadMultiple(item);

		expect(result).toEqual([ item ]);
	});

	it('should pass an array of items through by default', () => {
		const items = [ { a: 1 }, { a: 2 } ];
		const result = spreadMultiple(items);

		expect(result === items).true;
	});

	it('should optionally spread an array of items into a new array', () => {
		type Item = { a: number }
		const items: Item[] = [ { a: 1 }, { a: 2 } ];
		const result: Item[] = spreadMultiple(items, false);

		expect(result !== items).true;
	});

	it('should spread an generator', () => {
		function* generateItems() {
			yield { a: 1 };
			yield { a: 2 };
		}

		const result = spreadMultiple(generateItems());

		expect(result).toEqual([ { a: 1 }, { a: 2 } ]);
	});
});
