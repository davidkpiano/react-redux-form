import identity from './identity';

const defaultStrategies = {
  keys: Object.keys,
  get: (object, key) => object[key],
}

export function create(s = defaultStrategies) {
  function matcher(object) {
    return (compareObject) => {
      if (compareObject === object) return true;

      return s.keys(object)
        .every((key) => s.get(object, key) === s.get(compareObject, key));
    };
  }

  function propChecker(prop) {
    return (object) => object && !!object[prop];
  }

  const iteratee = (value) => {
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
  }

  const iterateeValue = (data, value) => {
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

  return {
    iteratee,
    iterateeValue
  }
}

const iterateeValue = create().iterateeValue;
export { 
  iterateeValue
};

const iteratee = create().iteratee;
export default iteratee;
