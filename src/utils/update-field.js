import icepick from 'icepick';
import get from './get';
import { initialFieldState } from '../reducers/v1-form-reducer';

export default function updateField(state, path, newState) {
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

  return icepick.setIn(state, fieldPath, icepick.merge(
    fieldState,
    icepick.merge(fieldState, updatedFieldState)));
}
