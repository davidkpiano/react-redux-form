import mapValues from './map-values';
import invertValidity from './invert-validity';

export default function invertValidators(validators) {
  if (typeof validators === 'function') {
    return (val) => invertValidity(validators(val));
  }

  return mapValues(validators, invertValidators);
}
