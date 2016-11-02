import actionTypes from '../../action-types';
import updateField, { getFieldAndForm } from '../../utils/update-field';
import updateParentForms from '../../utils/update-parent-forms';
import updateSubFields from '../../utils/update-sub-fields';
import getFieldForm from '../../utils/get-field-form';
import isPristine from '../../form/is-pristine';
import map from '../../utils/map';
import isPlainObject from 'lodash/isPlainObject';
import mapValues from '../../utils/map-values';
import inverse from '../../utils/inverse';
import isValid, { fieldsValid } from '../../form/is-valid';
import isValidityValid from '../../utils/is-validity-valid';
import isValidityInvalid from '../../utils/is-validity-invalid';
import fieldActions from '../../actions/field-actions';
import toPath from '../../utils/to-path';
import initialFieldState from '../../constants/initial-field-state';

export default function setFocusActionReducer(state, action, localPath) {
  const [field] = getFieldAndForm(state, localPath);
  const fieldState = field && field.$form
    ? field.$form
    : field;

  const fieldUpdates = {};
  const subFieldUpdates = {};
  let parentFormUpdates;

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

      parentFormUpdates = (form) => ({ pristine: isPristine(form) });

      break;
    }

    case actionTypes.SET_VALIDATING: {
      Object.assign(fieldUpdates, {
        validating: action.validating,
        validated: !action.validating,
      });

      break;
    }

    case actionTypes.SET_VALIDITY:
    case actionTypes.SET_ERRORS: {
      const isErrors = action.type === actionTypes.SET_ERRORS;
      const validity = isErrors ? action.errors : action.validity;

      const inverseValidity = isPlainObject(validity)
        ? mapValues(validity, inverse)
        : !validity;

      // If the field is a form, its validity is
      // also based on whether its fields are all valid.
      const areFieldsValid = (field && field.$form)
        ? fieldsValid(field)
        : true;

      Object.assign(fieldUpdates, {
        [isErrors ? 'errors' : 'validity']: validity,
        [isErrors ? 'validity' : 'errors']: inverseValidity,
        validating: false,
        validated: true,
        valid: areFieldsValid && (isErrors
          ? !isValidityInvalid(validity)
          : isValidityValid(validity)),
      });

      parentFormUpdates = (form) => ({ valid: isValid(form) });

      break;
    }

    case actionTypes.SET_FIELDS_VALIDITY: {
      return map(action.fieldsValidity, (fieldValidity, subField) =>
          fieldActions.setValidity(subField, fieldValidity, action.options)
        ).reduce((accState, subAction) => setFocusActionReducer(
          accState,
          subAction,
          localPath.concat(toPath(subAction.model))), state);
    }

    case actionTypes.RESET_VALIDITY: {
      Object.assign(fieldUpdates, {
        valid: initialFieldState.valid,
        validity: initialFieldState.validity,
        errors: initialFieldState.errors,
      });

      Object.assign(subFieldUpdates, {
        valid: initialFieldState.valid,
        validity: initialFieldState.validity,
        errors: initialFieldState.errors,
      });

      break;
    }

    case actionTypes.SET_PENDING: {
      Object.assign(fieldUpdates, {
        pending: action.pending,
        submitted: false,
        submitFailed: false,
        retouched: false,
      });

      parentFormUpdates = { pending: action.pending };

      break;
    }

    case actionTypes.SET_SUBMITTED: {
      const submitted = !!action.submitted;

      Object.assign(fieldUpdates, {
        pending: false,
        submitted,
        submitFailed: submitted
          ? false
          : fieldState && fieldState.submitFailed,
        touched: true,
        retouched: false,
      });

      Object.assign(subFieldUpdates, {
        submitted,
        submitFailed: submitted
          ? false
          : fieldUpdates.submitFailed,
        retouched: false,
      });

      break;
    }

    case actionTypes.SET_SUBMIT_FAILED: {
      Object.assign(fieldUpdates, {
        pending: false,
        submitted: fieldState.submitted && !action.submitFailed,
        submitFailed: !!action.submitFailed,
        touched: true,
        retouched: false,
      });

      Object.assign(subFieldUpdates, {
        pending: false,
        submitted: !action.submitFailed,
        submitFailed: !!action.submitFailed,
        touched: true,
        retouched: false,
      });

      break;
    }

    default:
      return state;
  }

  const updatedField = updateField(state, localPath, fieldUpdates);
  const updatedSubFields = Object.keys(subFieldUpdates).length
    ? updateSubFields(updatedField, localPath, subFieldUpdates)
    : updatedField;
  const updatedParentForms = parentFormUpdates
    ? updateParentForms(updatedSubFields, localPath, parentFormUpdates)
    : updatedSubFields;

  return updatedParentForms;
}
