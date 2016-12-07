export function immutableMapValues(iterable, iteratee) {
	return iterable.map((val, key) => iteratee(val, key, iterable));
}

export default function mapValues(object, iteratee) {
  const result = {};

  Object.keys(object || {}).forEach((key) => {
    result[key] = iteratee(object[key], key, object);
  });

  return result;
}