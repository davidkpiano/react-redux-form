import { List } from 'immutable';

export default function findKey(object, predicate) {
  let resultKey;

  if (List.isList(object)) {
    resultKey = object.findKey(predicate);
  } else {
    Object.keys(object).some((key) => {
      const isKey = predicate(object[key], key, object);

      if (isKey) {
        resultKey = key;
        return true;
      }

      return false;
    });
  }

  return resultKey;
}
