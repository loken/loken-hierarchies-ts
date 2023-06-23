export type TraversalType = 'breadth-first' | 'depth-first';

export type TraverseGraph = {
	type?: TraversalType,
}

export type TraverseSelf = {
	excludeSelf?: boolean,
}

export type TraverseGraphSelf = TraverseGraph & TraverseSelf;
