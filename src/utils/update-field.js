import icepick from 'icepick';
import get from './get';
import mapValues from './map-values';
import { initialFieldState } from '../reducers/v1-form-reducer';

export default function updateField(state, path, newState, newSubState) {
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

    return icepick.setIn(state, path, formState);
  }

  return icepick.setIn(state, fieldPath, icepick.assign(
    fieldState,
    updatedFieldState));
}
