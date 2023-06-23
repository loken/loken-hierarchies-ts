import { iterateMultiple, Multiple } from './collections/iteration/multiple.js';
import { Node } from './node.js';


/** Means of getting an ID for an `item`. */
export type Identify<TItem, TId> = (item: TItem) => TId;

/** Means of getting an optional ID for an `item`. */
export type IdentifyOptional<TItem, TId> = (item: TItem) => TId | undefined;


/** Extract the `item` from each of the `nodes`. */
export const nodesToItems = <TItem>(nodes: Multiple<Node<TItem>>) => {
	const items: TItem[] = [];

	for (let node of iterateMultiple(nodes))
		items.push(node.item);

	return items;
};

/** Extract the ID from the `node.item`. */
export const nodeToId = <TItem, TId = TItem>(node: Node<TItem>, identify?: (item: TItem) => TId): TId => {
	return identify?.(node.item) ?? node.item as any;
};

/** Extract the ID from each `node.item`. */
export const nodesToIds = <TItem, TId = TItem>(nodes: Multiple<Node<TItem>>, identify?: (item: TItem) => TId): TId[] => {
	const ids: TId[] = [];

	for (let node of iterateMultiple(nodes))
		ids.push(identify?.(node.item) ?? node.item as any);

	return ids;
};
