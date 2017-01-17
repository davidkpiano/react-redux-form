import _get from 'lodash.get';
import endsWith from './ends-with';

export default function get(object, path, defaultValue) {
  let modelString = path;

  if (typeof path === 'number') {
    const result = object[path];

    return result === undefined ? defaultValue : result;
  }

  if (!path.length) return object;

  if (endsWith(modelString, '.')) {
    modelString = modelString.slice(0, -1);
  } else if (endsWith(modelString, '[]')) {
    modelString = modelString.slice(0, -2);
  }

  return _get(object, modelString, defaultValue);
}
