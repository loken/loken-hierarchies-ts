const escapeExpression = /[.?*+^$[\]\\(){}|-]/g;

/**
 * Escape input before using it to create a regex to match the input.
 * (We don't want a dot to mean everything, for example.)
 */
export const escapeRegex = (input: string): string => {
	return (input + '').replace(escapeExpression, '\\$&');
};
