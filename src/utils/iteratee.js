import identity from './identity';
import _get from '../utils/get';

const defaultStrategy = {
  get: _get,
};


export function createIteratee(s = defaultStrategy) {
  function matcher(object) {
    return (compareObject) => {
      if (compareObject === object) return true;

      return Object.keys(object)
        .every((key) => s.get(object, key) === s.get(compareObject, key));
    };
  }

  function propChecker(prop) {
    return (object) => object && !!s.get(object, prop);
  }

  return (value) => {
    if (typeof value === 'function') {
      return value;
    }

    if (value === null) {
      return identity;
    }

    if (typeof value === 'object') {
      return matcher(value);
    }

    return propChecker(value);
  };
}

const iteratee = createIteratee();

export function iterateeValue(data, value) {
  if (typeof value === 'function') {
    return value(data);
  }

  if (!Array.isArray(value)
    && typeof value !== 'object'
    && typeof value !== 'string') {
    return !!value;
  }

  return iteratee(value)(data);
}

export default iteratee;
