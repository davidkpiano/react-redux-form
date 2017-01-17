import get from '../utils/get';
import actionTypes from '../action-types';
import updateField, { getFieldAndForm } from '../utils/update-field';
import updateParentForms from '../utils/update-parent-forms';
import updateSubFields from '../utils/update-sub-fields';
import getFieldForm from '../utils/get-field-form';
import isPristine from '../form/is-pristine';
import map from '../utils/map';
import isPlainObject from '../utils/is-plain-object';
import _mapValues from '../utils/map-values';
import inverse from '../utils/inverse';
import isValid, { fieldsValid } from '../form/is-valid';
import isValidityValid from '../utils/is-validity-valid';
import isValidityInvalid from '../utils/is-validity-invalid';
import fieldActions from '../actions/field-actions';
import toPath from '../utils/to-path';
import initialFieldState from '../constants/initial-field-state';
import i from 'icepick';
import identity from 'lodash/identity';
import merge from '../utils/merge';

const defaultStrategies = {
  set: i.set,
  setIn: i.setIn,
  keys: Object.keys,
  get,
  fromJS: identity,
  toJS: identity,
  merge: i.assign,
  mergeDeep: i.merge,
  mapValues: _mapValues,
  isObject: isPlainObject,
  isValid,
  isPristine,
  fieldsValid,
  initialFieldState,
};

export function createFormActionReducer(s = defaultStrategies) {
  const resetFieldState = (field, key) => {
    if (!s.isObject(field)) return field;

    const intents = [{ type: 'validate' }];
    let resetValue = s.get(field, 'initialValue');
    let loadedValue = s.get(field, 'loadedValue');

    if (loadedValue && s.get(field, 'initialValue') !== loadedValue) {
      intents.push({ type: 'load', value: loadedValue });
      resetValue = loadedValue;
    }

    if (key === '$form') {
      return s.merge(s.initialFieldState, {
        value: resetValue,
        model: s.get(field, 'model'),
        intents,
      });
    }

    if (s.get(field, '$form')) return s.mapValues(field, resetFieldState);

    return s.mergeDeep(s.initialFieldState, s.fromJS({
      value: resetValue,
      model: s.get(field, 'model'),
      intents
    }));
  };

  const setInitialFieldState = (field, key) => {
    if (!s.isObject(field)) return field;

    if (key === '$form') {
      return s.mergeDeep(s.initialFieldState, {
        value: s.get(field, 'value'),
        model: s.get(field, 'model'),
      });
    }

    if (s.get(field, '$form')) return s.mapValues(field, resetFieldState);

    return s.mergeDeep(s.initialFieldState, {
      value: s.get(field, 'value'),
      model: s.get(field, 'model'),
    });
  };

  const addIntent = (intents, newIntent) => {
    if (!intents || intents.size === 0) return s.fromJS([newIntent]);
    if (intents.some(intent => s.get(intent, 'type') === s.get(newIntent, 'type'))) return intents;

    return intents.concat(newIntent);
  };

  const clearIntents = (intents, oldIntent) => {
    if (!intents || typeof oldIntent === 'undefined') return s.fromJS([]);
    return intents.filter(intent => s.get(intent, 'type') !== s.get(oldIntent, 'type'));
  };

  return function formActionsReducer(state, action, localPath) {
    const [field] = getFieldAndForm(state, localPath, s);

    const $form = s.get(field, '$form');
    const fieldState = field && $form
      ? $form
      : field;
    const intents = s.get(fieldState, 'intents');
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
        const fieldForm = s.get(getFieldForm(state, localPath), '$form');

        fieldUpdates = s.fromJS({
          focus: action.type === actionTypes.BLUR
            ? false
            : s.get(field, 'focus'),
          touched: true,
          retouched: fieldForm
            ? !!(s.get(fieldForm, 'submitted') || s.get(fieldForm, 'submitFailed'))
            : false,
        });
  
        parentFormUpdates = {
          touched: true,
          retouched: s.get(fieldUpdates, 'retouched'),
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

        parentFormUpdates = (form) => ({ pristine: s.isPristine(form) });

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
            ? merge({ ...s.toJS(fieldState).errors }, action.errors)
            : action.errors;
        } else {
          validity = action.merge
            ? merge({ ...s.toJS(fieldState).validity }, action.validity)
            : action.validity;
        }

        const inverseValidity = s.isObject(validity)
          ? s.mapValues(s.fromJS(validity), inverse)
          : !validity;

        // If the field is a form, its validity is
        // also based on whether its fields are all valid.
        const areFieldsValid = (field && s.get(field, '$form'))
          ? s.fieldsValid(field)
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
          fieldUpdates.asyncKeys = s.keys(isErrors ? action.errors : action.validity);
        }

        parentFormUpdates = (form) => ({ valid: s.isValid(form) });

        break;
      }

      case actionTypes.SET_FIELDS_VALIDITY: {
        const mapResult = map(action.fieldsValidity, (fieldValidity, subField) =>
          fieldActions.setValidity(subField, fieldValidity, action.options));

        let accState = state;

        mapResult.forEach((subAction) => {
          accState = s.merge(accState, formActionsReducer(
            accState,
            subAction,
            localPath.concat(toPath(subAction.model))));
        });

        return accState;
      }

      case actionTypes.RESET_VALIDITY: {
        const plainFieldState = s.toJS(fieldState);
        let validity = { ...plainFieldState.validity };
  let errors = { ...plainFieldState.errors };
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
            : fieldState && s.get(fieldState, 'submitFailed'),
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
          submitted: s.get(fieldState, 'submitted') && !action.submitFailed,
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
        return updateField(state, localPath, resetFieldState, resetFieldState, undefined, s);
      }
      case actionTypes.SET_INITIAL: {
        return updateField(state, localPath, setInitialFieldState, setInitialFieldState, undefined, s);
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

    fieldUpdates = s.fromJS(fieldUpdates);
    subFieldUpdates = s.fromJS(subFieldUpdates);
    parentFormUpdates = s.fromJS(parentFormUpdates);

    const updatedField = updateField(state, localPath, fieldUpdates, undefined, undefined, s);

    const updatedSubFields = s.toJS(s.keys(subFieldUpdates)).length
      ? updateSubFields(updatedField, localPath, subFieldUpdates, s)
      : updatedField;

    const updatedParentForms = parentFormUpdates
      ? updateParentForms(updatedSubFields, localPath, parentFormUpdates, s)
      : updatedSubFields;

    return updatedParentForms;
  };
}

const formActionReducer = createFormActionReducer();
export default formActionReducer;