import actionTypes from '../action-types';
import updateField, { getFieldAndForm } from '../utils/update-field';
import updateParentForms from '../utils/update-parent-forms';
import updateSubFields from '../utils/update-sub-fields';
import getFieldForm from '../utils/get-field-form';
import isPristine from '../form/is-pristine';
import map from '../utils/map';
import isPlainObject from '../utils/is-plain-object';
import mapValues from '../utils/map-values';
import inverse from '../utils/inverse';
import mergeValidity from '../utils/merge-validity';
import isValid, { fieldsValid } from '../form/is-valid';
import isValidityValid from '../utils/is-validity-valid';
import isValidityInvalid from '../utils/is-validity-invalid';
import fieldActions from '../actions/field-actions';
import toPath from '../utils/to-path';
import initialFieldState from '../constants/initial-field-state';
import i from 'icepick';
import { fieldOrForm, getMeta } from '../utils/create-field';

const resetFieldState = (field) => {
  if (!isPlainObject(field)) return field;

  const intents = [{ type: 'validate' }];
  let resetValue = getMeta(field, 'initialValue');

  const loadedValue = getMeta(field, 'loadedValue');


  if (loadedValue && (resetValue !== loadedValue)) {
    intents.push({ type: 'load' });
    resetValue = loadedValue;
  }

  return fieldOrForm(
    getMeta(field, 'model'),
    resetValue,
    { intents }
  );
};

const setInitialFieldState = (field, key) => {
  if (!isPlainObject(field)) return field;

  if (key === '$form') {
    return i.assign(initialFieldState, {
      value: field.value,
      model: field.model,
    });
  }

  if (field.$form) return mapValues(field, resetFieldState);

  return i.assign(initialFieldState, {
    value: field.value,
    model: field.model,
  });
};

const addIntent = (intents, newIntent) => {
  if (!intents) return [newIntent];
  if (intents.some(intent => intent.type === newIntent.type)) return intents;

  return intents.concat(newIntent);
};

const clearIntents = (intents, oldIntent) => {
  if (!intents || typeof oldIntent === 'undefined') return [];
  return intents.filter(intent => intent.type !== oldIntent.type);
};

export default function formActionsReducer(state, action, localPath) {
  const [field] = getFieldAndForm(state, localPath);
  const fieldState = field && field.$form
    ? field.$form
    : field;
  const { intents } = fieldState;

  let fieldUpdates = {};
  let subFieldUpdates = {};
  let parentFormUpdates;

  switch (action.type) {
    case actionTypes.FOCUS: {
      fieldUpdates = {
        focus: true,
        intents: action.silent
          ? intents
          : addIntent(intents, action),
      };

      break;
    }

    case actionTypes.BLUR:
    case actionTypes.SET_TOUCHED: {
      const fieldForm = getFieldForm(state, localPath).$form;

      fieldUpdates = {
        focus: action.type === actionTypes.BLUR
          ? false
          : field.focus,
        touched: true,
        retouched: fieldForm
          ? !!(fieldForm.submitted || fieldForm.submitFailed)
          : false,
      };

      parentFormUpdates = {
        touched: true,
        retouched: fieldUpdates.retouched,
      };

      break;
    }

    case actionTypes.SET_UNTOUCHED: {
      fieldUpdates = {
        focus: false,
        touched: false,
      };

      break;
    }

    case actionTypes.SET_PRISTINE:
    case actionTypes.SET_DIRTY: {
      const pristine = action.type === actionTypes.SET_PRISTINE;

      fieldUpdates = {
        pristine,
      };

      subFieldUpdates = {
        pristine,
      };

      parentFormUpdates = (form) => ({ pristine: isPristine(form) });

      break;
    }

    case actionTypes.SET_VALIDATING: {
      fieldUpdates = {
        validating: action.validating,
        validated: !action.validating,
      };

      break;
    }

    case actionTypes.SET_VALIDITY:
    case actionTypes.SET_ERRORS: {
      const isErrors = action.type === actionTypes.SET_ERRORS;
      let validity;
      if (isErrors) {
        validity = action.merge
          ? mergeValidity(fieldState.errors, action.errors)
          : action.errors;
      } else {
        validity = action.merge
          ? mergeValidity(fieldState.validity, action.validity)
          : action.validity;
      }

      const inverseValidity = isPlainObject(validity)
        ? mapValues(validity, inverse)
        : !validity;

      // If the field is a form, its validity is
      // also based on whether its fields are all valid.
      const areFieldsValid = (field && field.$form)
        ? fieldsValid(field)
        : true;

      fieldUpdates = {
        [isErrors ? 'errors' : 'validity']: validity,
        [isErrors ? 'validity' : 'errors']: inverseValidity,
        validating: false,
        validated: true,
        valid: areFieldsValid && (isErrors
          ? !isValidityInvalid(validity)
          : isValidityValid(validity)),
      };

      if (action.async) {
        fieldUpdates.asyncKeys = Object.keys(isErrors ? action.errors : action.validity);
      }

      parentFormUpdates = (form) => ({ valid: isValid(form) });

      break;
    }

    case actionTypes.SET_FIELDS_VALIDITY: {
      return map(action.fieldsValidity, (fieldValidity, subField) =>
          fieldActions.setValidity(subField, fieldValidity, action.options)
        ).reduce((accState, subAction) => formActionsReducer(
          accState,
          subAction,
          localPath.concat(toPath(subAction.model))), state);
    }

    case actionTypes.RESET_VALIDITY: {
      let validity = { ...fieldState.validity };
      let errors = { ...fieldState.errors };
      let valid;

      if (action.omitKeys) {
        action.omitKeys.forEach((key) => {
          delete validity[key];
          delete errors[key];
        });
        valid = isValidityValid(validity);
      } else {
        validity = initialFieldState.validity;
        errors = initialFieldState.errors;
        valid = initialFieldState.valid;
      }

      fieldUpdates = {
        valid,
        validity,
        errors,
      };

      subFieldUpdates = {
        valid: initialFieldState.valid,
        validity: initialFieldState.validity,
        errors: initialFieldState.errors,
      };

      break;
    }

    case actionTypes.SET_PENDING: {
      fieldUpdates = {
        pending: action.pending,
        submitted: false,
        submitFailed: false,
        retouched: false,
      };

      parentFormUpdates = { pending: action.pending };

      break;
    }

    case actionTypes.SET_SUBMITTED: {
      const submitted = !!action.submitted;

      fieldUpdates = {
        pending: false,
        submitted,
        submitFailed: submitted
          ? false
          : fieldState && fieldState.submitFailed,
        touched: true,
        retouched: false,
      };

      subFieldUpdates = {
        submitted,
        submitFailed: submitted
          ? false
          : fieldUpdates.submitFailed,
        retouched: false,
      };

      break;
    }

    case actionTypes.SET_SUBMIT_FAILED: {
      fieldUpdates = {
        pending: false,
        submitted: fieldState.submitted && !action.submitFailed,
        submitFailed: !!action.submitFailed,
        touched: true,
        retouched: false,
      };

      subFieldUpdates = {
        pending: false,
        submitted: !action.submitFailed,
        submitFailed: !!action.submitFailed,
        touched: true,
        retouched: false,
      };

      break;
    }

    case actionTypes.RESET: {
      return localPath.length
        ? i.setIn(state, localPath, resetFieldState(field))
        : resetFieldState(field);
    }

    case actionTypes.SET_INITIAL: {
      return updateField(state, localPath, setInitialFieldState, setInitialFieldState);
    }

    case actionTypes.ADD_INTENT: {
      fieldUpdates = {
        intents: addIntent(intents, action.intent),
      };

      break;
    }

    case actionTypes.CLEAR_INTENTS: {
      fieldUpdates = {
        intents: clearIntents(intents, action.intent),
      };

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
