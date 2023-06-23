import { Multiple, spreadMultiple } from './collections/iteration/multiple.js';
import { DeBrand, Node } from './node.js';
import { Identify, nodesToIds, nodesToItems } from './node-conversion.js';
import { traverseGraph } from './traversal/traverse-graph.js';
import { TraverseSelf } from './traversal/traverse-types.js';


/**
 * Keeps track of the a set of nodes and their roots
 * and provides structural modification.
 */
export class Hierarchy<TItem, TId = TItem> {

	/** Create a hierarchy using the provided `identify` function. */
	constructor(identify: Identify<TItem, TId>) {
		this.#identify = identify;
	}

	//#region backing fields
	#identify: Identify<TItem, TId>;
	#roots: Node<TItem>[] = [];
	#nodes = new Map<TId, Node<TItem>>();
	#debrand = new Map<TId, DeBrand>();
	//#endregion

	//#region accessors
	/** Means of getting an ID for an `item`. */
	public get identify() { return this.#identify; }
	/** Get a shallow clone of the roots. */
	public get roots() { return [ ...this.#roots ]; }
	/** Get a shallow clone of all nodes. */
	public get nodes() { return [ ...this.#nodes.values() ]; }

	/**
	 * Get node by `id`.
	 * @param id The ID of the node to retrieve.
	 * @throws The 'id' must be a hierarchy member.
	 */
	public getNode(id: TId): Node<TItem> {
		const node = this.#nodes.get(id);
		if (node === undefined)
			throw new Error("The 'id' must be a hierarchy member.");

		return node;
	}

	/**
	 * Get item by `id`.
	 * @param id The ID of the item to retrieve.
	 * @throws The 'id' must be a hierarchy member.
	 */
	public get(id: TId): TItem {
		return this.getNode(id).item;
	}
	//#endregion

	//#region links
	/**
	 * Attach the provided `roots`.
	 * @param roots Nodes to attach.
	 */
	public attachRoot(roots: Multiple<Node<TItem>>): this {
		const nodes = spreadMultiple(roots);

		if (!nodes.every(n => n.isRoot))
			throw new Error("The 'roots' all be roots!");

		this.#addNodes(nodes);

		this.#roots.push(...nodes);

		return this;
	}

	/**
	 * Attach the provided `children` to the node of the provided `parentId`.
	 * @param parentId The ID of the node to attach to.
	 * @param children Nodes to attach.
	 */
	public attach(parentId: TId, children: Multiple<Node<TItem>>): this {
		const nodes = spreadMultiple(children);

		if (this.#nodes.has(parentId))
			throw new Error("The 'parentId' must be a hierarchy member.");

		this.#addNodes(nodes);

		const parent = this.#nodes.get(parentId)!;
		parent.attach(nodes);

		return this;
	}

	#addNodes(nodes: Multiple<Node<TItem>>) {
		for (let node of traverseGraph({
			roots: nodes,
			next:  node => node.children,
		})) {
			let id = this.#identify(node.item);
			this.#debrand.set(id, node.brand(this));
			this.#nodes.set(id, node);
		}
	}
	//#endregion

	//#region traversal
	/**
	 * Get the chain of ancestor nodes starting with the node for the item matching the `id`.
	 */
	public getAncestorNodes(options: {id: TId} & TraverseSelf) {
		return this.getNode(options.id).getAncestors(options);
	}

	/**
	 * Get the items from the chain of ancestor nodes starting with the node for the item matching the `id`.
	 */
	public getAncestors(options: {id: TId} & TraverseSelf) {
		return nodesToItems(this.getNode(options.id).traverseAncestors(options));
	}

	/**
	 * Get the IDs from the chain of ancestor nodes starting with the node for the item matching the `id`.
	 */
	public getAncestorIds(options: {id: TId} & TraverseSelf) {
		return nodesToIds(this.getNode(options.id).traverseAncestors(options), this.#identify);
	}

	/**
	 * Get the chain of descendant nodes starting with the node for the item matching the `id`.
	 */
	public getDescendantNodes(options: {id: TId} & TraverseSelf) {
		return this.getNode(options.id).getDescendants(options);
	}

	/**
	 * Get the items from the chain of descendant nodes starting with the node for the item matching the `id`.
	 */
	public getDescendants(options: {id: TId} & TraverseSelf) {
		return nodesToItems(this.getNode(options.id).traverseDescendants(options));
	}

	/**
	 * Get the IDs from the chain of descendant nodes starting with the node for the item matching the `id`.
	 */
	public getDescendantIds(options: {id: TId} & TraverseSelf) {
		return nodesToIds(this.getNode(options.id).traverseDescendants(options), this.#identify);
	}
	//#endregion

}
