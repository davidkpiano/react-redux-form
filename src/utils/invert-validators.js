import mapValues from './map-values';

export default function invertValidators(validators) {
  if (typeof validators === 'function') {
    return (val) => !validators(val);
  }

  return mapValues(validators, invertValidators);
}
