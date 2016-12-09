export default function pick(object, props) {
  const result = {};

  for (const prop of props) {
    result[prop] = object[prop];
  }

  return result;
}
