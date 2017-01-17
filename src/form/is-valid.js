import isPlainObject from '../utils/is-plain-object';
import get from '../utils/get';
import Immutable from 'immutable';

const defaultStrategies = {
  get,
  keys: Object.keys,
};

export function create(s = defaultStrategies) {
  function isValid(formState, options = { async: true }) {
    if (!formState) return true;

    if (!s.get(formState, '$form')) {
      const errors = s.get(formState, 'errors');

      if (!Array.isArray(errors)
        && !isPlainObject(errors)
        && !Immutable.Iterable.isIterable(errors)) {
          return !errors;
      }

      return s.keys(errors).every((errorKey) => {
        // if specified to ignore async validator keys and
        // current error key is an async validator key,
        // treat key as valid
        if (!options.async
          && s.get(formState, 'asyncKeys')
          && !!~s.get(formState, 'asyncKeys').indexOf(errorKey)) {
          return true;
        }

        const valid = !s.get(errors, errorKey);

        return valid;
      });
    }

    return s.keys(formState)
    .every((key) => isValid(s.get(formState, key), options));
  }

  function fieldsValid(formState) {
    return s.keys(formState)
    .every((key) => (key === '$form') || isValid(s.get(formState, key)));
  }

  return {
    isValid,
    fieldsValid,
  };
}

const mutableFn = create();
const isValid = mutableFn.isValid;

export default isValid;
export const fieldsValid = mutableFn.fieldsValid;