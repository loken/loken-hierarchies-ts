import { describe, expect, it } from 'vitest';

import { Queue } from '../../src/collections/queue.js';

describe('queue', () => {
	it('should be first-in-first-out (FIFO)', () => {
		const queue = new Queue<string>();

		queue.enqueue('one');
		queue.enqueue('two');

		expect(queue.count).toBe(2);

		const a = queue.dequeue();
		const b = queue.dequeue();

		expect(a).toBe('one');
		expect(b).toBe('two');
	});
});
