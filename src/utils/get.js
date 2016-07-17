import _get from 'lodash/get';
import endsWith from 'lodash/endsWith';

export default function get(object, path, defaultValue) {
  let modelString = path;

  if (path && !path.length) return object;

  if (endsWith(modelString, '.')) {
    modelString = modelString.slice(0, -1);
  } else if (endsWith(modelString, '[]')) {
    modelString = modelString.slice(0, -2);
  }

  return _get(object, modelString, defaultValue);
}
