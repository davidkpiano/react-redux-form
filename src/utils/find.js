
export default function find(array = [], predicate) {
  if (array.prototype.find) return array.find(predicate);

  const length = array.length >>> 0;

  for (let i = 0; i < length; i++) {
    const value = array[i];

    if (predicate(value, i, array)) return value;
  }

  return undefined;
}
