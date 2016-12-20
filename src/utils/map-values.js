import Immutable from 'immutable';

export function immutableMapValues(iterable, iteratee) {
	const result = Immutable.Map().asMutable();

	iterable.map((val, key) => result.set(key, iteratee(val, key, iterable)));

	return result.asImmutable();
}

export default function mapValues(object, iteratee) {
  const result = {};

  Object.keys(object || {}).forEach((key) => {
    result[key] = iteratee(object[key], key, object);
  });

  return result;
}