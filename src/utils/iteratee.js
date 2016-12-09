import identity from './identity';

function matcher(object) {
  return (compareObject) => {
    if (compareObject === object) return true;

    return Object.keys(object)
      .every((key) => object[key] === compareObject[key]);
  };
}

function propChecker(prop) {
  return (object) => object && !!object[prop];
}

export default function iteratee(value) {
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
