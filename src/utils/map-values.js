function mapValues(object, iteratee) {
  const result = {};

  for (const key in object) {
    if ({}.hasOwnProperty.call(object, key)) {
      result[key] = iteratee(object[key], key, object);
    }
  }

  return result;
}

export default mapValues;
