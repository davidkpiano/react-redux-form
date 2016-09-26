import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';

export default function submittedActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.SET_SUBMITTED) {
    return state;
  }

  const submitted = !!action.submitted;

  return updateField(state, localPath,
    (fieldState) => ({
      pending: false,
      submitted,
      submitFailed: submitted
        ? false
        : fieldState.submitFailed,
      touched: true,
      retouched: false,
    }),
    (subFieldState, updatedFieldState) => ({
      submitted,
      submitFailed: submitted
        ? false
        : updatedFieldState.submitFailed,
      retouched: false,
    }));
}
