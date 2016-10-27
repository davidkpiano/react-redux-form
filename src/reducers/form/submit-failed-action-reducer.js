import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';
import updateSubFields from '../../utils/update-sub-fields';

export default function submitFailedActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.SET_SUBMIT_FAILED) {
    return state;
  }

  const updatedField = updateField(state, localPath, (fieldState) => ({
    pending: false,
    submitted: fieldState.submitted && !action.submitFailed,
    submitFailed: !!action.submitFailed,
    touched: true,
    retouched: false,
  }));

  const updatedSubFields = updateSubFields(updatedField, localPath, {
    pending: false,
    submitted: !action.submitFailed,
    submitFailed: !!action.submitFailed,
    touched: true,
    retouched: false,
  });

  return updatedSubFields;
}
