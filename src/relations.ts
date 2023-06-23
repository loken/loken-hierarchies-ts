import { iterateMultiple, Multiple } from './collections/iteration/multiple.js';
import { MultiMap } from './collections/multi-map/multi-map.js';


export type Relation<TId> = readonly [parent: TId, child: TId];
export type RelType = 'ancestors' | 'descendants' | 'children';
export type RelTypeFilter = RelType | RelType[];


/** Static helper for mapping between different representations of relations. */
export class Relations {

	/** Block instantiation by making the ctor private to simulate a static class. */
	private constructor() {}

	/** Create relations from the `childMap`. */
	public static fromChildMap<TId>(childMap: MultiMap<TId>): Relation<TId>[] {
		const relations: Relation<TId>[] = [];

		for (let [ parent, children ] of childMap.entries()) {
			for (let child of children.values())
				relations.push([ parent, child ]);
		}

		return relations;
	}

	/** Create a child map from the `relations`. */
	public static toChildMap<TId>(relations: Multiple<Relation<TId>>): MultiMap<TId> {
		let map = new MultiMap<TId>();

		for (let [ parent, child ] of iterateMultiple(relations))
			map.add(parent, child);

		return map;
	}

}
