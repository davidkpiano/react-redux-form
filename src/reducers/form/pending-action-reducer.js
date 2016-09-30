import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';
import updateParentForms from '../../utils/update-parent-forms';

export default function pendingActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.SET_PENDING) {
    return state;
  }

  const newState = updateField(state, localPath, {
    pending: action.pending,
    submitted: false,
    submitFailed: false,
    retouched: false,
  });

  return updateParentForms(newState, localPath, {
    pending: action.pending,
  });
}
