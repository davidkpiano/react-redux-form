import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';
import getFieldForm from '../../utils/get-field-form';

export default function blurTouchActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.SET_UNTOUCHED) {
    return state;
  }

  const fieldForm = getFieldForm(state, localPath).$form;

  return updateField(state, localPath, (fieldState) => ({
    focus: false,
    touched: false,
  }));
}
