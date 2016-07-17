import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';

export default function submittedActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.SET_SUBMITTED) {
    return state;
  }

  return updateField(state, localPath, (fieldState) => ({
    pending: false,
    submitted: !!action.submitted,
    submitFailed: action.submitted || fieldState.submitFailed,
    touched: true,
    retouched: false,
  }));
}
