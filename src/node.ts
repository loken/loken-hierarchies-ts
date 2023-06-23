import { Multiple, spreadMultiple } from './collections/iteration/multiple.js';
import { traverseGraph } from './traversal/traverse-graph.js';
import { traverseSequence } from './traversal/traverse-sequence.js';
import { TraverseGraphSelf, TraverseSelf } from './traversal/traverse-types.js';


/**
 * Delegate that can be called in order to remove the "brand" from
 * the node that returned this delegate when it was branded.
 */
export type DeBrand = () => void;

/**
 * Wrapper for a `TItem` participating in a double-linked graph.
 *
 * By using a wrapper rather than require specific properties on the type parameter
 * we don't need to make any assumptions about the wrapped type.
 */
export class Node<TItem> {

	/** Create a node wrapping the `item`. */
	constructor(item: TItem) {
		this.#item = item;
	}

	//#region backing fields
	#item: TItem;
	#parent?: Node<TItem>;
	#children?: Set<Node<TItem>>;

	/** The brand is used to lock the node to a specific owner. */
	#brand?: any;
	//#endregion

	//#region accessors
	/** The item is the subject/content of the node. */
	public get item() {
		return this.#item;
	}

	/** Link to the parent node. */
	public get parent() {
		return this.#parent;
	}

	/** Links to the child nodes. */
	public get children() {
		return this.#children ? [ ...this.#children ] : [];
	}
	//#endregion

	//#region predicates
	/** A node is a "root" when there is no `parent`. */
	public get isRoot() {
		return this.#parent === undefined;
	}

	/** A node is a "leaf" when there are no `children`. */
	public get isLeaf() {
		return this.#children === undefined || this.#children.size === 0;
	}

	/** A node is "internal" when it has `children`, meaning it's either "internal" or a "leaf". */
	public get isInternal() {
		return !this.isLeaf;
	}

	/**
	 * A node is "linked" when it is neither a root nor a child.
	 *
	 * A node is "linked" when it has a parent or at least one child.
	 */
	public get isLinked() {
		return !this.isRoot || !this.isLeaf;
	}

	/** Having a brand means that some other entity "owns" the node. */
	public get isBranded(): boolean {
		return this.#brand !== undefined;
	}
	//#endregion

	//#region brands
	/**
	 * When the brands of two nodes are compatible, they may be linked/attached
	 * in a parent-child relationship.
	 */
	public isBrandCompatible(other: Node<TItem>): boolean {
		if (this.#brand === undefined)
			return other.#brand === undefined;
		else if (other.#brand === undefined)
			return false;
		else
			return this.#brand.Equals(other.#brand);
	}

	/**
	 * Adds the provided `brand` to the node,
	 * providing an `DeBrand` delegate for removing/clearing the brand.
	 */
	public brand(brand: any): DeBrand {
		if (brand === undefined)
			throw new Error("The brand cannot be 'undefined'.");

		if (this.#brand !== undefined)
			throw new Error("Must clear existing brand using the 'DeBrand' delegate before you can re-brand a node.");

		this.#brand = brand;

		return () => this.#brand = undefined;
	}
	//#endregion

	//#region links
	/**
	 * Attach the provided `children`.
	 */
	public attach(children: Multiple<Node<TItem>>): this {
		const nodes = spreadMultiple(children);

		if (nodes.length === 0)
			throw new Error("Must provide one or more 'children'.");

		if (!nodes.every(node => node.isRoot))
			throw new Error("Must all be without a 'parent' before attaching to another.");

		if (!nodes.every(node => node.isBrandCompatible(this)))
			throw new Error('Must all have a compatible brand.');

		this.#children ??= new Set<Node<TItem>>();

		for (let child of nodes) {
			this.#children.add(child);
			child.#parent = this;
		}

		return this;
	}

	/** Detach the provided `children`. */
	public detach(children: Multiple<Node<TItem>>): this {
		const nodes = spreadMultiple(children);

		if (nodes.length === 0)
			throw new Error("Must provide one or more 'children'.");

		if (this.isLeaf || !nodes.every(child => this.#children!.has(child)))
			throw new Error("Must all be 'children'.");

		if (nodes.some(child => child.isBranded))
			throw new Error("Must clear brand using the 'DeBrand' delegate before you can detach a branded node.");

		for (let node of nodes) {
			this.#children!.delete(node);
			node.#parent = undefined;
		}

		if (this.isLeaf)
			this.#children = undefined;

		return this;
	}

	/** Detach the node from it's `parent`. */
	public detachSelf(): this {
		if (this.isRoot)
			throw new Error("Can't detach a root node as there's nothing to detach it from.");

		if (this.isBranded)
			throw new Error("Must clear brand using the 'DeBrand' delegate before you can detach a branded node.");

		if (this.#parent!.isLeaf || !this.#parent!.#children!.has(this))
			throw new Error('Invalid object state: It should not be possible for the node not to be a child of its parent!.');

		this.#parent!.#children!.delete(this);

		if (this.#parent!.isLeaf)
			this.#parent!.#children = undefined;

		this.#parent = undefined;

		return this;
	}

	/**
	 * Dismantling a node means to cascade detach it.
	 * We always cascade detach the nodes.
	 * We may also cascade up the ancestry, in which case the node is detached,
	 * and then the parent is dismantled, leading to the whole linked structure
	 * ending up unlinked.
	 * @param includeAncestry
	 * Should we cascade through the ancestry (true) or only cascade through the nodes (false)?
	 * No default value is because the caller should always make an active choice.
	 */
	public dismantle(includeAncestry: boolean): this {
		if (!this.isRoot && includeAncestry) {
			const parent = this.#parent!;
			this.detachSelf();
			parent.dismantle(true);
		}

		for (let descendant of this.traverseDescendants({ excludeSelf: true }))
			descendant.detachSelf();

		return this;
	}
	//#endregion

	//#region traversal
	/**
	 * Get ancestor nodes by traversing according to the options.
	 */
	public getAncestors(options?: TraverseSelf) {
		return [ ...this.traverseAncestors(options) ];
	}

	/**
	 * Generate a sequence of ancestor nodes by traversing according to the options.
	 */
	public traverseAncestors(options?: TraverseSelf) {
		return traverseSequence({
			first: options?.excludeSelf ? this.#parent : this,
			next:  node => node?.parent,
		});
	}

	/**
	 * Get descendant nodes by traversing according to the options.
	 */
	public getDescendants(options?: TraverseGraphSelf) {
		return [ ...this.traverseDescendants(options) ];
	}

	/**
	 * Generate a sequence of descendant nodes by traversing according to the options.
	 */
	public traverseDescendants(options?: TraverseGraphSelf) {
		return traverseGraph({
			type:  options?.type,
			roots: options?.excludeSelf ? this.children : this,
			next:  node => node.children,
		});
	}
	//#endregion

}
