import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';
import mapValues from '../../utils/map-values';
import initialFieldState from '../../constants/initial-field-state';
import isPlainObject from 'lodash/isPlainObject';
import i from 'icepick';

const resetFieldState = (field, key) => {
  if (!isPlainObject(field) || key === '$form') return field;

  if (field.$form) return mapValues(field, resetFieldState);

  return i.merge(initialFieldState, {
    value: field.initialValue,
    model: field.model,
    intents: [{ type: 'validate' }],
  });
};

export default function resetActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.RESET
    && action.type !== actionTypes.SET_INITIAL) {
    return state;
  }

  return updateField(state, localPath, resetFieldState, resetFieldState);
}
