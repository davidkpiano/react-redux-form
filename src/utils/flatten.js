const flattenObject = function flatten(target) {
  const delimiter = '.';
  let currentDepth = 1;
  const output = {};

  function step(object, prev) {
    Object.keys(object).forEach((key) => {
      const value = object[key];
      const isarray = Array.isArray(value);
      const type = Object.prototype.toString.call(value);
      const isobject = (
        type === '[object Object]' ||
        type === '[object Array]'
      );

      const newKey = prev
        ? prev + delimiter + key
        : key;

      if (!isarray && isobject && Object.keys(value).length && !value.model) {
        ++currentDepth;
        step(value, newKey);
      } else {
        output[newKey] = value;
      }
    });
  }

  step(target);

  return output;
};

export default flattenObject;
