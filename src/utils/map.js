
export default function map(values, iteratee) {
  if (Array.isArray(values)) {
    return values.map(iteratee);
  }

  const result = Object.keys(values).map((key) =>
    iteratee(values[key], key, values));

  return result;
}
