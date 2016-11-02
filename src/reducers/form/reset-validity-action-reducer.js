import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';
import initialFieldState from '../../constants/initial-field-state';
import updateSubFields from '../../utils/update-sub-fields';

export default function resetValidityActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.RESET_VALIDITY) {
    return state;
  }

  const updatedField = updateField(state, localPath, {
    valid: initialFieldState.valid,
    validity: initialFieldState.validity,
    errors: initialFieldState.errors,
  });

  const updatedSubFields = updateSubFields(updatedField, localPath, {
    valid: initialFieldState.valid,
    validity: initialFieldState.validity,
    errors: initialFieldState.errors,
  });

  return updatedSubFields;
}
