import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';
import mapValues from '../../utils/map-values';
import initialFieldState from '../../constants/initial-field-state';
import i from 'icepick';

const resetFieldState = (field) => {
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
