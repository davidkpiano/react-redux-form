import actionTypes from '../../action-types';
import updateField, { getFieldAndForm } from '../../utils/update-field';
import getFieldForm from '../../utils/get-field-form';

export default function setFocusActionReducer(state, action, localPath) {
  const [field] = getFieldAndForm(state, localPath);

  const updatedField = {};

  switch (action.type) {
    case actionTypes.FOCUS:
      Object.assign(updatedField, {
        focus: true,
        intents: action.silent
          ? []
          : [action],
      });

      break;

    case actionTypes.BLUR:
    case actionTypes.SET_TOUCHED: {
      const fieldForm = getFieldForm(state, localPath).$form;

      Object.assign(updatedField, {
        focus: action.type === actionTypes.BLUR
          ? false
          : field.focus,
        touched: true,
        retouched: fieldForm
          ? !!(fieldForm.submitted || fieldForm.submitFailed)
          : false,
      });

      break;
    }

    case actionTypes.SET_UNTOUCHED:
      Object.assign(updateField, {
        focus: false,
        touched: false,
      });

      break;

    default:
      return state;
  }

  return updateField(state, localPath, updatedField);
}
