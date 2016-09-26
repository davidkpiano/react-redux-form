import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';
import { initialFieldState } from '../form-reducer';

export default function resetValidityActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.RESET_VALIDITY) {
    return state;
  }

  return updateField(state, localPath, {
    validity: initialFieldState.validity,
    errors: initialFieldState.errors,
  }, {
    validity: initialFieldState.validity,
    errors: initialFieldState.errors,
  });
}
