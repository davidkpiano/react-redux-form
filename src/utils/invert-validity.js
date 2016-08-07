import isPlainObject from 'lodash/isPlainObject';
import mapValues from './map-values';

export default function invertValidity(validity) {
  if (isPlainObject(validity)) {
    return mapValues(validity, invertValidity);
  }

  return !validity;
}
