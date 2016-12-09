import isPlainObject from './is-plain-object';

export default function isValidityInvalid(errors) {
  if (Array.isArray(errors)) {
    return errors.some(isValidityInvalid);
  }

  if (isPlainObject(errors)) {
    return Object.keys(errors).some((key) =>
      isValidityInvalid(errors[key]));
  }

  return !!errors;
}
