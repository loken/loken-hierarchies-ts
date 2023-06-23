import { TryResult } from '../utilities/try.js';
import { Multiple } from './iteration/multiple.js';

export interface ILinear<T> {
	readonly count: number;
	attach(items: Multiple<T>): number;
	detach(): T;
	tryDetach(): TryResult<T>;
	peek(): T;
	tryPeek(): TryResult<T>;
	clear(): void;

}
