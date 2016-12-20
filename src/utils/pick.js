export default function pick(object, props) {
  const result = {};

  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    result[prop] = object[prop];
  }

  return result;
}
