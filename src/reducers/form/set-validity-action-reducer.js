import actionTypes from '../../action-types';
import isPlainObject from 'lodash/isPlainObject';
import mapValues from '../../utils/map-values';
import get from '../../utils/get';
import icepick from 'icepick';
import isBoolean from 'lodash/isBoolean';
import every from 'lodash/every';

import { initialFieldState } from '../v1-form-reducer';

function inverse(value) {
  return !value;
}

export default function setValidityActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.SET_VALIDITY) return state;

  const errors = isPlainObject(action.validity)
    ? mapValues(action.validity, inverse)
    : !action.validity;

  const field = localPath.length
    ? get(state, localPath, initialFieldState)
    : state;

  const fieldPath = field.hasOwnProperty('$form')
    ? [...localPath, '$form']
    : localPath;
  const fieldState = get(state, fieldPath, initialFieldState);

  const validatedField = icepick.merge(fieldState, {
    validity: action.validity,
    valid: isBoolean(errors)
      ? !errors
      : every(errors, inverse),
    errors,
    validated: true,
  });

  const validatedFieldState = icepick.setIn(state, fieldPath, validatedField);

  return validatedFieldState;
}
