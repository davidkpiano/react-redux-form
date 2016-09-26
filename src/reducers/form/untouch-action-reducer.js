import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';

export default function blurTouchActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.SET_UNTOUCHED) {
    return state;
  }

  return updateField(state, localPath, () => ({
    focus: false,
    touched: false,
  }));
}
