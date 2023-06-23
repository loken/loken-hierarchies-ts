/**
 * Result from try* functions where the `value` is narrowed to
 * `T` or `undefined` depending on the value of `success`.
 */
export type TryResult<T> =
	{ value:  T,         success: true  } |
	{ value?: undefined, success: false };
