import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';
import mapValues from '../../utils/map-values';
import initialFieldState from '../../constants/initial-field-state';
import i from 'icepick';

export default function resetActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.RESET
    && action.type !== actionTypes.SET_INITIAL) {
    return state;
  }

  const resetFieldState = (field) => {
    if (field.$form) return mapValues(field, resetFieldState);

    return i.merge(initialFieldState, {
      value: field.initialValue,
      model: field.model,
    });
  };

  return updateField(state, localPath, resetFieldState, resetFieldState);
}
