import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';
import initialFieldState from '../../constants/initial-field-state';

export default function resetActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.RESET
    && action.type !== actionTypes.SET_INITIAL) {
    return state;
  }

  return updateField(state, localPath, initialFieldState, initialFieldState);
}
