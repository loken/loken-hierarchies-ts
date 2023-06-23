import { TryResult } from '../utilities/try.js';
import { iterateMultiple, Multiple } from './iteration/multiple.js';
import { ILinear } from './linear.js';

export class Queue<T> {

	#queue = new Map<number, T>();
	#head = 0;
	#tail = 0;

	public get count() {
		return this.#tail - this.#head;
	}

	public enqueue(items: Multiple<T>): number {
		let count = 0;

		for (let item of iterateMultiple(items)) {
			this.#queue.set(this.#tail++, item);
			count++;
		}

		return count;
	}

	public dequeue(): T {
		if (this.#tail === this.#head)
			throw new Error('No more items in queue!');

		const item = this.#queue.get(this.#head)!;
		this.#queue.delete(this.#head++);

		return item;
	}

	public tryDequeue(): TryResult<T> {
		if (this.#tail === this.#head)
			return { success: false };

		const item = this.#queue.get(this.#head)!;
		this.#queue.delete(this.#head++);

		return { value: item, success: true };
	}

	public peek(): T {
		if (this.#tail === this.#head)
			throw new Error('No more items in queue!');

		return this.#queue.get(this.#head)!;
	}

	public tryPeek(): TryResult<T> {
		if (this.#tail === this.#head)
			return { success: false };

		return { value: this.#queue.get(this.#head)!, success: true };
	}

	public clear(): void {
		this.#queue.clear();
		this.#head = 0;
		this.#tail = 0;
	}

}

export class LinearQueue<T> extends Queue<T> implements ILinear<T> {

	public attach(items: Multiple<T>): number {
		return super.enqueue(items);
	}

	public detach(): T {
		return super.dequeue();
	}

	public tryDetach(): TryResult<T> {
		return super.tryDequeue();
	}

}
