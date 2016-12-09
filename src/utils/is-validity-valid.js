import isPlainObject from './is-plain-object';
import every from 'lodash/_baseEvery';

export default function isValidityValid(validity) {
  if (isPlainObject(validity)) {
    return every(validity, isValidityValid);
  }

  return !!validity;
}
