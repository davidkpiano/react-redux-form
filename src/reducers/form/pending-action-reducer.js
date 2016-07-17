import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';

export default function pendingActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.SET_PENDING) {
    return state;
  }

  return updateField(state, localPath, () => ({
    pending: action.pending,
    submitted: false,
    submitFailed: false,
    retouched: false,
  }));
}
