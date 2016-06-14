import get from './get';
import { initialFieldState } from '../reducers/v1-form-reducer';

export default function getFieldForm(state, path) {
  const formPath = path.slice(0, -1);

  if (!formPath.length) return state;

  return get(state, formPath);
}
