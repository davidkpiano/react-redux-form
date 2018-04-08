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
import { getMeta, fieldOrForm, updateFieldState } from '../utils/create-field';
import assocIn from '../utils/assoc-in';
import getFormValue from '../utils/get-form-value';

const resetFieldState = (field, customInitialFieldState) => {
  if (!isPlainObject(field)) return field;

  const intents = [{ type: 'reset' }];
  let resetValue = getMeta(field, 'initialValue');
  const loadedValue = getMeta(field, 'loadedValue');

  if (loadedValue && (resetValue !== loadedValue)) {
    intents.push({ type: 'load' });
    resetValue = loadedValue;
  }
  return fieldOrForm(
    getMeta(field, 'model'),
    resetValue,
    { ...customInitialFieldState, intents }
  );
};

const setInitialFieldState = (customInitialFieldState) => field => {
  if (!isPlainObject(field)) return field;

  if (field.$form) {
    // eslint-disable-next-line arrow-body-style
    return mapValues(field, (fieldState, key) => {
      return key === '$form'
        ? updateFieldState(customInitialFieldState, {
          value: field.value,
          model: field.model,
        })
        : resetFieldState(fieldState, customInitialFieldState);
    });
  }

  return updateFieldState(customInitialFieldState, {
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

const defaultOptions = {
  initialFieldState,
};

export function createFormActionsReducer(options) {
  const formOptions = options
    ? {
      ...defaultOptions,
      ...options,
      initialFieldState: {
        ...defaultOptions.initialFieldState,
        ...options.initialFieldState,
      },
    }
    : defaultOptions;

  const customInitialFieldState = formOptions.initialFieldState;

  return function formActionsReducer(state, action, localPath) {
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
          ? fieldsValid(field, { async: false })
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
          const actionValidity = isErrors ? action.errors : action.validity;

          fieldUpdates.asyncKeys = (isPlainObject(actionValidity) || Array.isArray(actionValidity))
            ? Object.keys(actionValidity)
            : true;
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
        let errors;
        let valid;

        if (action.omitKeys && typeof fieldState.errors !== 'string') {
          errors = { ...fieldState.errors };
          action.omitKeys.forEach((key) => {
            delete validity[key];
            delete errors[key];
          });
          valid = isValidityValid(validity);
        } else {
          validity = customInitialFieldState.validity;
          errors = customInitialFieldState.errors;
          valid = customInitialFieldState.valid;
        }

        fieldUpdates = {
          valid,
          validity,
          errors,
        };

        subFieldUpdates = {
          valid: customInitialFieldState.valid,
          validity: customInitialFieldState.validity,
          errors: customInitialFieldState.errors,
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

        subFieldUpdates = {
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
          pending: false,
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
          ? assocIn(state, localPath, resetFieldState(field, customInitialFieldState))
          : resetFieldState(field, customInitialFieldState);
      }

      case actionTypes.SET_INITIAL: {
        const setCustomInitialFieldState = setInitialFieldState(customInitialFieldState);

        return updateField(
          state,
          localPath,
          setCustomInitialFieldState,
          setCustomInitialFieldState);
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

      case actionTypes.CHANGE: {
        return updateParentForms(state, localPath, (parentForm) => {
          const formModelValue = getFormValue(parentForm);

          if (!parentForm.$form) {
            return {
              ...customInitialFieldState,
              value: formModelValue,
              initialValue: formModelValue,
            };
          }

          // If the form is invalid (due to async validity)
          // but its fields are valid and the value has changed,
          // the form should be "valid" again.
          if ((!parentForm.$form.validity
              || typeof parentForm.$form.validity === 'boolean'
              || !Object.keys(parentForm.$form.validity).length)
            && !parentForm.$form.valid
            && isValid(parentForm, { async: false })) {
            return {
              value: formModelValue,
              validity: true,
              errors: false,
              valid: true,
            };
          }

          return {
            value: formModelValue,
          };
        });
      }

      default:
        return state;
    }

    if (action.clearIntents) {
      fieldUpdates.intents = clearIntents(intents, action.clearIntents);
    }

    const updatedField = updateField(state, localPath, fieldUpdates);
    const updatedSubFields = Object.keys(subFieldUpdates).length
      ? updateSubFields(updatedField, localPath, subFieldUpdates)
      : updatedField;
    const updatedParentForms = parentFormUpdates
      ? updateParentForms(updatedSubFields, localPath, parentFormUpdates)
      : updatedSubFields;

    return updatedParentForms;
  };
}

export default createFormActionsReducer();
