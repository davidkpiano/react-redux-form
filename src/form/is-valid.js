import isPlainObject from '../utils/is-plain-object';

export default function isValid(formState, options = { async: true }) {
  if (!formState) return true;

  if (!formState.$form) {
    const { errors } = formState;

    if (!Array.isArray(errors) && !isPlainObject(errors)) {
      return !errors;
    }

    return Object.keys(formState.errors).every((errorKey) => {
      // if specified to ignore async validator keys and
      // current error key is an async validator key,
      // treat key as valid
      if (!options.async
        && formState.asyncKeys
        && !!~formState.asyncKeys.indexOf(errorKey)) {
        return true;
      }

      const valid = !formState.errors[errorKey];

      return valid;
    });
  }

  return Object.keys(formState)
    .every((key) => isValid(formState[key], options));
}

export function fieldsValid(formState) {
  return Object.keys(formState)
    .every((key) => (key === '$form') || isValid(formState[key]));
}
