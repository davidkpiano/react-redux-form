import getValue from './get-value';
import mapValues from './map-values';

export default function getValidity(validators, value) {
  const modelValue = getValue(value);

  if (typeof validators === 'function') {
    return validators(modelValue);
  }

  return mapValues(validators, (validator) => getValidity(validator, modelValue));
}
