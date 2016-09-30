import isPlainObject from 'lodash/isPlainObject';
import get from './get';
import initialFieldState from '../constants/initial-field-state';

export default function getField(state, path) {
  if (process.env.NODE_ENV !== 'production') {
    if (!isPlainObject(state)) {
      throw new Error(`Could not retrieve field '${path}' `
        + 'from an invalid/empty form state.');
    }
  }

  const result = get(state, path, initialFieldState);

  if ('$form' in result) return result.$form;

  return result;
}
