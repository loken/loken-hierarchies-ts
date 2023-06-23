import { describe, expect, it } from 'vitest';

import { MultiMap } from '../../../src/collections/multi-map/multi-map.js';
import { trimLines } from '../../../src/primitives/string/lines.js';


describe('MultiMap<string> serialization', () => {
	const source = trimLines(`
	A:A1,A2
	A1:A11,A12
	B:B1,B2
	`);

	const map = new MultiMap<string>();
	map.add('A', [ 'A1', 'A2' ]);
	map.add('A1', [ 'A11', 'A12' ]);
	map.add('B', [ 'B1', 'B2' ]);

	it('should render a `MultiMap<string>` to a string', () => {
		const rendered = MultiMap.render(map);

		expect(rendered).toEqual(source);
	});

	it('should parse a string into a `MultiMap<string>`', () => {
		const parsed = MultiMap.parse(source);

		expect(parsed).toEqual(map);
	});

	it('should parse and render a `MultiMap<string>` using custom separators', () => {
		const input = 'A>A1+A2#A1>A11+A12#B>B1+B2';

		const sep = MultiMap.getSeparators({
			entry:    '#',
			keyValue: '>',
			value:    '+',
		});

		const parsed = MultiMap.parse(input, sep);
		const rendered = MultiMap.render(parsed, sep);

		expect(rendered).toEqual(input);
	});
});

describe('MultiMap<number> serialization', () => {
	const source = trimLines(`
	1:11,12
	11:111,112
	2:21,22
	`);

	const map = new MultiMap<number>();
	map.add(1, [ 11, 12 ]);
	map.add(11, [ 111, 112 ]);
	map.add(2, [ 21, 22 ]);

	it('should render a `MultiMap<number>` to a string', () => {
		const rendered = MultiMap.render(map);

		expect(rendered).toEqual(source);
	});

	it('should parse a string into a `MultiMap<number>`', () => {
		const parsed = MultiMap.parse(source, { transform: parseInt });

		expect(parsed).toEqual(map);
	});
});
