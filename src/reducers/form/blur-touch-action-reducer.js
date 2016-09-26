import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';
import getFieldForm from '../../utils/get-field-form';

export default function blurTouchActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.BLUR
    && action.type !== actionTypes.SET_TOUCHED) {
    return state;
  }

  const fieldForm = getFieldForm(state, localPath).$form;

  return updateField(state, localPath, (fieldState) => ({
    focus: action.type === actionTypes.BLUR
      ? false
      : fieldState.focus,
    touched: true,
    retouched: fieldForm
      ? !!(fieldForm.submitted || fieldForm.submitFailed)
      : false,
  }));
}
