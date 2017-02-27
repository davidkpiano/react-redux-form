import identity from './identity';

function objClone(obj) {
  const keys = Object.keys(obj);
  const length = keys.length;
  const result = {};
  let index = 0;
  let key;

  for (; index < length; index += 1) {
    key = keys[index];
    result[key] = obj[key];
  }
  return result;
}

export function assoc(state, key, value) {
  const newState = objClone(state);

  newState[key] = value;

  return newState;
}

export default function assocIn(state, path, value, fn = identity) {
  if (!path.length) return value;

  const key0 = path[0];

  if (path.length === 1) {
    return fn(assoc(state, key0, value));
  }

  return fn(assoc(state, key0, assocIn(state[key0] || {}, path.slice(1), value, fn)));
}
