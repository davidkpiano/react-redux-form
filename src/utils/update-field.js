import icepick from 'icepick';
import get from './get';
import mapValues from './map-values';
import { initialFieldState } from '../reducers/form-reducer';

function assocIn(state, path, value, fn) {
  if (!fn) return icepick.assocIn(state, path, value);

  const key0 = path[0];

  if (path.length === 1) {
    return fn(icepick.assoc(state, key0, value));
  }

  return fn(icepick.assoc(state, key0, assocIn(state[key0] || {}, path.slice(1), value, fn)));
}

export default function updateField(state, path, newState, newSubState, updater) {
  const field = path.length
    ? get(state, path, initialFieldState)
    : state;

  const fieldPath = field.hasOwnProperty('$form')
    ? [...path, '$form']
    : path;

  const fieldState = get(state, fieldPath, initialFieldState);

  const updatedFieldState = typeof newState === 'function'
    ? newState(fieldState)
    : newState;

  if ('$form' in field && newSubState) {
    const formState = mapValues(field, (subState, key) => {
      if (key === '$form') {
        return icepick.assign(
          fieldState,
          updatedFieldState);
      }

      const updatedSubState = typeof newSubState === 'function'
        ? newSubState(subState, updatedFieldState)
        : newSubState;

      return icepick.assign(subState, updatedSubState);
    });

    if (!path.length) return formState;

    return assocIn(state, path, formState, updater);
  }

  return assocIn(state, fieldPath, icepick.assign(
    fieldState,
    updatedFieldState), updater);
}
