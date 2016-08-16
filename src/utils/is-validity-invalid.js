import isPlainObject from 'lodash/isPlainObject';
import arraySome from 'lodash/_arraySome';
import baseSome from 'lodash/_baseSome';

export default function isValidityInvalid(errors) {
  const some = Array.isArray(errors)
    ? arraySome
    : baseSome;

  if (isPlainObject(errors)) {
    return some(errors, isValidityInvalid);
  }

  return !!errors;
}
