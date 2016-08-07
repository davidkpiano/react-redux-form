import isPlainObject from 'lodash/isPlainObject';
import some from 'lodash/some';

export default function isValidityInvalid(errors) {
  if (isPlainObject(errors)) {
    return some(errors, isValidityInvalid);
  }

  return !!errors;
}
