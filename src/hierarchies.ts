import { Multiple, spreadMultiple } from './collections/iteration/multiple.js';
import { MultiMap } from './collections/multi-map/multi-map.js';
import { Hierarchy } from './hierarchy.js';
import { Identify, IdentifyOptional } from './node-conversion.js';
import { Nodes } from './nodes.js';
import { Relation, Relations } from './relations.js';


export type HierarchyIdSpec<Id> = Relation<Id>[] | MultiMap<Id> | Hierarchy<any, Id>;

export type HierarchyItemOptions<Item, Id> = CreateOptions<Item, Id> & (SpecOptions<Id> | ParentedOptions<Item, Id>);

type CreateOptions<Item, Id> = {
	identify: Identify<Item, Id>,
	items: Multiple<Item>,
}

type SpecOptions<Id> = {
	spec: HierarchyIdSpec<Id>,
	identifyParent?: never,
}

type ParentedOptions<Item, Id> = {
	identifyParent: IdentifyOptional<Item, Id>,
	spec?: never,
}


export class Hierarchies {

	public static createForIds<Id>(): Hierarchy<Id> {
		return new Hierarchy<Id>(id => id);
	}

	public static createForItems<Item, Id>(identify: Identify<Item, Id>): Hierarchy<Item, Id> {
		return new Hierarchy<Item, Id>(identify);
	}

	public static createWithIds<Id>(spec: HierarchyIdSpec<Id>): Hierarchy<Id> {
		const childMap = Hierarchies.idSpecToChildMap(spec);
		const roots = Nodes.assembleIds(childMap);

		return Hierarchies.createForIds<Id>().attachRoot(roots);
	}

	public static createWithItems<Item, Id>(options: HierarchyItemOptions<Item, Id>): Hierarchy<Item, Id> {
		const items = spreadMultiple(options.items);

		const childMap = options.spec
			? Hierarchies.idSpecToChildMap(options.spec)
			: Hierarchies.parentedItemsToChildMap(items, options);

		const roots = Nodes.assembleItems({
			identify: options.identify,
			items:    items,
			childMap,
		});

		return new Hierarchy<Item, Id>(options.identify).attachRoot(roots);
	}

	private static idSpecToChildMap<Id>(spec: HierarchyIdSpec<Id>): MultiMap<Id> {
		if (spec instanceof MultiMap)
			return spec;
		if (Array.isArray(spec))
			return Relations.toChildMap(spec);
		else
			return Hierarchies.toChildMap(spec);
	}

	private static parentedItemsToChildMap<Item, Id>(
		items: Item[],
		options: CreateOptions<Item, Id> & ParentedOptions<Item, Id>,
	) {
		const map = new MultiMap<Id>();

		for (let item of items) {
			let parent = options.identifyParent(item);
			if (parent !== undefined)
				map.add(parent, options.identify(item));
		}

		return map;
	}

	public static toChildMap<Item, Id>(hierarchy: Hierarchy<Item, Id>): MultiMap<Id> {
		return Nodes.toChildMap(hierarchy.roots, hierarchy.identify);
	}

	public static toRelations<Item, Id>(hierarchy: Hierarchy<Item, Id>): Relation<Id>[] {
		return Nodes.toRelations(hierarchy.roots, hierarchy.identify);
	}

}
