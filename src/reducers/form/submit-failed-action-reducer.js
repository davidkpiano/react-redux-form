import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';

export default function submitFailedActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.SET_SUBMIT_FAILED) {
    return state;
  }

  return updateField(state, localPath, (fieldState) => ({
    pending: false,
    submitted: fieldState.submitted && !action.submitFailed,
    submitFailed: !!action.submitFailed,
    touched: true,
    retouched: false,
  }));
}
