import { iterateAll } from './collections/iteration/iterate.js';
import { iterateMultiple, Multiple } from './collections/iteration/multiple.js';
import { mapGetLazy } from './collections/map.js';
import { MultiMap } from './collections/multi-map/multi-map.js';
import { Node } from './node.js';
import { Identify, nodesToIds, nodeToId } from './node-conversion.js';
import { Relation } from './relations.js';
import { traverseGraph } from './traversal/traverse-graph.js';

export class Nodes {

	/**
	 * Build nodes of IDs linked as described by the provided `childMap`.
	 *
	 * @template Id The type of IDs.
	 * @param childMap The map describing the relations.
	 * @returns The root nodes.
	 */
	public static assembleIds<Id>(childMap: MultiMap<Id>): Node<Id>[] {
		let nodes = new Map<Id, Node<Id>>();
		let roots = new Map<Id, Node<Id>>();

		for (let parentId of childMap.keys()) {
			let parentNode = new Node(parentId);
			roots.set(parentId, parentNode);
			nodes.set(parentId, parentNode);
		}

		for (let [ parentId, childIds ] of childMap.entries()) {
			let parentNode = nodes.get(parentId)!;

			for (let childId of childIds) {
				let childNode = mapGetLazy(nodes, childId, () => new Node(childId));
				parentNode.attach(childNode);
				roots.delete(childId);
			}
		}

		return [ ...roots.values() ];
	}

	/**
	 * Build nodes of `items` linked as described by the provided `childMap`.
	 *
	 * @template Item The type of item.
	 * @template Id The type of IDs.
	 * @param identify Means of getting an ID for an item.
	 * @param items The items to wrap in nodes.
	 * @param childMap The map describing the relations.
	 * @returns The root nodes.
	 */
	public static assembleItems<Item, Id>(options: {
		identify: Identify<Item, Id>,
		items: Multiple<Item>,
		childMap: MultiMap<Id>,
	}): Node<Item>[] {
		const { identify, items, childMap } = options;
		const nodes = new Map<Id, Node<Item>>();
		const roots = new Map<Id, Node<Item>>();

		for (let item of iterateMultiple(items)) {
			let id = identify(item);
			let node = new Node(item);

			nodes.set(id, node);

			if (childMap.has(id))
				roots.set(id, node);
		}

		for (let [ parentId, childIds ] of childMap.entries()) {
			let parent = nodes.get(parentId)!;

			for (let childId of childIds) {
				let childNode = nodes.get(childId)!;
				parent.attach(childNode);
				roots.delete(childId);
			}
		}

		return [ ...roots.values() ];
	}

	public static toChildMap<Item, Id = Item>(
		roots: Multiple<Node<Item>>,
		identify?: Identify<Item, Id>,
	): MultiMap<Id> {
		const map = new MultiMap<Id>();

		const traversal = traverseGraph({
			roots,
			signal: (node, signal) => {
				signal.next(node.children);

				if (!node.isLeaf) {
					let nodeId: Id = nodeToId(node, identify);
					let ids = nodesToIds(node.children, identify);
					map.add(nodeId, ids);
				}
			},
		});

		iterateAll(traversal);

		return map;
	}

	public static toRelations<Item, Id = Item>(
		roots: Multiple<Node<Item>>,
		identify?: Identify<Item, Id>,
	): Relation<Id>[] {
		const relations: Relation<Id>[] = [];

		const traversal = traverseGraph({
			roots,
			signal: (node, signal) => {
				signal.next(node.children);

				if (!node.isLeaf) {
					let nodeId: Id = nodeToId(node, identify);
					for (let child of node.children)
						relations.push([ nodeId, nodeToId(child, identify) ]);
				}
			},
		});

		iterateAll(traversal);

		return relations;
	}

}
