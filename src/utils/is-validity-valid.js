import isPlainObject from './is-plain-object';

export default function isValidityValid(validity) {
  if (isPlainObject(validity)) {
    return Object.keys(validity).every((key) =>
      isValidityValid(validity[key]));
  }

  return !!validity;
}
