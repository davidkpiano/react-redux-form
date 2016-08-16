
export default function findKey(object, predicate) {
  let resultKey;

  Object.keys(object).some((key) => {
    const isKey = predicate(object[key], key, object);

    if (isKey) {
      resultKey = key;
      return true;
    }

    return false;
  });

  return resultKey;
}
