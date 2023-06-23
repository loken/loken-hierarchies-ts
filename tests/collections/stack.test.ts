import { describe, expect, it } from 'vitest';

import { Stack } from '../../src/collections/stack.js';

describe('stack', () => {
	it('should be last-in-first-out (LIFO)', () => {
		const stack = new Stack<string>();

		stack.push('one');
		stack.push('two');

		expect(stack.count).toBe(2);

		const a = stack.pop();
		const b = stack.pop();

		expect(a).toBe('two');
		expect(b).toBe('one');
	});
});
