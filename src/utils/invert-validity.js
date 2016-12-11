import isPlainObject from './is-plain-object';
import mapValues from './map-values';

export default function invertValidity(validity) {
  if (isPlainObject(validity)) {
    return mapValues(validity, invertValidity);
  }

  return !validity;
}
