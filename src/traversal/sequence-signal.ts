import { TryResult } from '../utilities/try.js';

/**
 * Use this to signal to the traversal what's `next` and what to `skip`.
 */
export interface ISequenceSignal<TEl> {
	get index(): number;
	get count(): number;

	next(element?: TEl): void;
	skip(): void;
}

/**
 * @internal Has some members which must be public for internal use
 *           which should not be used by a consumer.
 */
export class SequenceSignal<TEl> implements ISequenceSignal<TEl> {

	//#region fields
	#element?: TEl;
	#index = -1;
	#count = 0;
	#skipped = false;
	//#endregion

	//#region ISequenceSignal
	public get index() { return this.#index; }
	public get count() { return this.#count; }

	public next(element?: TEl) {
		this.#element = element;
	}

	public skip() {
		this.#skipped = true;
	}
	//endregion

	//#region internal
	constructor(options: {first: TEl | undefined}) {
		this.#element = options.first;
	}

	public shouldYield(): boolean {
		return !this.#skipped;
	}

	public cleanup(): void {
		if (!this.#skipped)
			this.#count++;
	}

	public tryGetNext(): TryResult<TEl> {
		if (this.#element !== undefined) {
			const element = this.#element;
			this.#skipped = false;
			this.#element = undefined;
			this.#index++;

			return { value: element, success: true };
		}
		else {
			return { success: false };
		}
	}
	//#endregion

}
