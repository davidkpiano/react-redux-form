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

  return icepick.setIn(state, fieldPath, icepick.merge(
    fieldState,
    newState));
}
