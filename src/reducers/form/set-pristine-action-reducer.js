import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';

export default function setValidityActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.SET_PRISTINE) {
    return state;
  }

  return updateField(state, localPath, {
    pristine: true,
  });
}
