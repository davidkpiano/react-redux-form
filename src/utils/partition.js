export default function partition(collection, predicate) {
  const result = [[], []];

  collection.forEach((item, index) => {
    if (predicate(item, index, collection)) {
      result[0].push(item);
    } else {
      result[1].push(item);
    }
  });

  return result;
}
