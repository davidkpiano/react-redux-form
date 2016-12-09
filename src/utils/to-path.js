import _toPath from 'lodash.toPath';
import endsWith from './ends-with';

export default function toPath(value) {
  let path = value;

  if (endsWith(path, '.')) {
    path = path.slice(0, -1);
  } else if (endsWith(path, '[]')) {
    path = path.slice(0, -2);
  }

  return _toPath(path);
}
