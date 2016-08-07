import isPlainObject from 'lodash/isPlainObject';
import every from 'lodash/every';

export default function isValidityValid(validity) {
  if (isPlainObject(validity)) {
    return every(validity, isValidityValid);
  }

  return !!validity;
}
