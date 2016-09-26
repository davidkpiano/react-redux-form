function mapValues(object, iteratee) {
  const result = {};

  Object.keys(object || {}).forEach((key) => {
    result[key] = iteratee(object[key], key, object);
  });

  return result;
}

export default mapValues;
