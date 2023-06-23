import { Multiple } from '../collections/iteration/multiple.js';
import { ILinear } from '../collections/linear.js';
import { LinearQueue } from '../collections/queue.js';
import { LinearStack, Stack } from '../collections/stack.js';
import { TryResult } from '../utilities/try.js';
import { TraversalType } from './traverse-types.js';

/**
 * Use this to signal to the traversal what's `next`,
 * what to `skip` and whether to `end`.
 */
export interface IGraphSignal<TNode> {
	get depth(): number;
	get count(): number;

	next(nodes: Multiple<TNode>): void;
	skip(): void;
	end(): void;
}

/**
 * @internal Has some members which must be public for internal use
 *           which should not be used by a consumer.
 */
export class GraphSignal<TNode> implements IGraphSignal<TNode> {

	//#region fields
	#visited?: Set<TNode>;
	#isDepthFirst: boolean;
	#nodes: ILinear<TNode>;
	#depth = 0;
	#branchCount: Stack<number>;
	#depthCount = 0;
	#count = 0;
	#skipped = false;
	//#endregion

	//#region IGraphSignal
	public get depth() { return this.#depth; }
	public get count() { return this.#count; }

	public next(nodes: Multiple<TNode>) {
		const count = this.#nodes.attach(nodes);

		if (this.#isDepthFirst && count > 0)
			this.#branchCount.push(count);
	}

	public skip() {
		this.#skipped = true;
	}

	public end() {
		this.#nodes.clear();
	}
	//endregion

	//#region internal
	constructor(options: {roots: Multiple<TNode>, detectCycles?: boolean, type?: TraversalType}) {
		if (options.detectCycles ?? false)
			this.#visited = new Set<TNode>();

		this.#isDepthFirst = options.type === 'depth-first';

		this.#nodes = this.#isDepthFirst
			? new LinearStack<TNode>()
			: new LinearQueue<TNode>();

		this.#depthCount = this.#nodes.attach(options.roots);

		if (this.#isDepthFirst) {
			this.#branchCount = new Stack<number>();
			this.#branchCount.push(this.#depthCount);
		}
	}

	public shouldYield(): boolean {
		return !this.#skipped;
	}

	public cleanup(): void {
		if (this.#isDepthFirst) {
			let res = this.#branchCount.tryPeek();

			while (res.success && res.value === 0) {
				this.#branchCount.pop();

				res = this.#branchCount.tryPeek();
			}
		}

		if (!this.#skipped)
			this.#count++;
	}

	public tryGetNext(): TryResult<TNode> {
		if (this.#visited !== undefined) {
			let res: TryResult<TNode> = this.tryGetNextInternal();
			while (res.success) {
				if (!this.#visited.has(res.value)) {
					this.#visited.add(res.value);

					return res;
				}

				res = this.tryGetNextInternal();
			}

			return { success: false };
		}
		else {
			return this.tryGetNextInternal();
		}
	}

	private tryGetNextInternal(): TryResult<TNode> {
		const res = this.#nodes.tryDetach();
		if (res.success) {
			this.#skipped = false;

			if (this.#isDepthFirst) {
				this.#depth = this.#branchCount.count - 1;
				this.#branchCount.push(this.#branchCount.pop() - 1);
			}
			else {
				if (this.#depthCount-- == 0) {
					this.#depth++;
					this.#depthCount = this.#nodes.count;
				}
			}

			this.#skipped = false;

			return res;
		}
		else {
			return res;
		}
	}
	//#endregion

}
