import actionTypes from '../../action-types';
import updateField, { getFieldAndForm } from '../../utils/update-field';
import updateParentForms from '../../utils/update-parent-forms';
import updateSubFields from '../../utils/update-sub-fields';
import getFieldForm from '../../utils/get-field-form';
import isPristine from '../../form/is-pristine';
import { compose } from 'redux';

export default function setFocusActionReducer(state, action, localPath) {
  const [field] = getFieldAndForm(state, localPath);

  const fieldUpdates = {};
  const subFieldUpdates = {};
  const parentFormUpdates = [];

  switch (action.type) {
    case actionTypes.FOCUS: {
      Object.assign(fieldUpdates, {
        focus: true,
        intents: action.silent
          ? []
          : [action],
      });

      break;
    }

    case actionTypes.BLUR:
    case actionTypes.SET_TOUCHED: {
      const fieldForm = getFieldForm(state, localPath).$form;

      Object.assign(fieldUpdates, {
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

    case actionTypes.SET_UNTOUCHED: {
      Object.assign(fieldUpdates, {
        focus: false,
        touched: false,
      });

      break;
    }

    case actionTypes.SET_PRISTINE:
    case actionTypes.SET_DIRTY: {
      const pristine = action.type === actionTypes.SET_PRISTINE;

      Object.assign(fieldUpdates, {
        pristine,
      });

      Object.assign(subFieldUpdates, {
        pristine,
      });

      parentFormUpdates.push((form) => ({ pristine: isPristine(form) }));

      break;
    }

    default:
      return state;
  }

  const updatedField = updateField(state, localPath, fieldUpdates);
  const updatedSubFields = Object.keys(subFieldUpdates).length
    ? updateSubFields(updatedField, localPath, subFieldUpdates)
    : updatedField;
  const updatedParentForms = parentFormUpdates.length
    ? updateParentForms(updatedSubFields, localPath, compose(...parentFormUpdates))
    : updatedSubFields;

  return updatedParentForms;
}
