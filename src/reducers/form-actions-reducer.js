import get from '../utils/get';
import actionTypes from '../action-types';
import updateField, { getFieldAndForm } from '../utils/update-field';
import updateParentForms from '../utils/update-parent-forms';
import updateSubFields from '../utils/update-sub-fields';
import getFieldForm from '../utils/get-field-form';
import map from '../utils/map';
import isPlainObject from 'lodash/isPlainObject';
import mapValues from '../utils/map-values';
import inverse from '../utils/inverse';
import isValid, { fieldsValid } from '../form/is-valid';
import isPristine from '../form/is-pristine';
import isValidityValid from '../utils/is-validity-valid';
import isValidityInvalid from '../utils/is-validity-invalid';
import fieldActions from '../actions/field-actions';
import toPath from '../utils/to-path';
import initialFieldState from '../constants/initial-field-state';
import i from 'icepick';
import identity from 'lodash/identity';
import _mapValues from '../utils/map-values';

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

    if (key === '$form') {
      return s.mergeDeep(s.fromJS(initialFieldState), s.fromJS({
        value: s.get(field, 'initialValue'),
        model: s.get(field, 'model'),
        intents: [
          { type: 'validate' },
          { type: 'load', value: s.get(field, 'initialValue') },
        ],
      }));
    }

    if (s.get(field, '$form')) return s.mapValues(field, resetFieldState);

    const result = s.mergeDeep(s.fromJS(initialFieldState), s.fromJS({
      value: s.get(field, 'initialValue'),
      model: s.get(field, 'model'),
      intents: [
        { type: 'validate' },
        { type: 'load', value: s.get(field, 'initialValue') },
      ],
    }));

    return result;
  };

  return function formActionsReducer(state, action, localPath, s = defaultStrategies) {
    const [field] = getFieldAndForm(state, localPath, s);

    const $form = s.get(field, '$form');
    const fieldState = field && $form
      ? $form
      : field;

    let fieldUpdates = {};
    let subFieldUpdates = {};
    let parentFormUpdates;

    switch (action.type) {
      case actionTypes.FOCUS: {
        fieldUpdates = {
          focus: true,
          intents: action.silent
            ? []
            : [action],
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
        const validity = isErrors ? action.errors : action.validity;

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

        parentFormUpdates = (form) => ({ valid: s.isValid(form) });

        break;
      }

      case actionTypes.SET_FIELDS_VALIDITY: {
        let mapResult = map(action.fieldsValidity, (fieldValidity, subField) => {
          return fieldActions.setValidity(subField, fieldValidity, action.options)
        });

        let accState = state;

        mapResult.forEach((subAction) => {
          accState = s.merge(accState, formActionsReducer(
            accState,
            subAction,
            localPath.concat(toPath(subAction.model)), s));
        });

        return accState;
      }

      case actionTypes.RESET_VALIDITY: {
        fieldUpdates = {
          valid: initialFieldState.valid,
          validity: initialFieldState.validity,
          errors: initialFieldState.errors,
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

      case actionTypes.RESET:
      case actionTypes.SET_INITIAL: {
        return updateField(state, localPath, resetFieldState, resetFieldState, undefined, s);
      }

      case actionTypes.ADD_INTENT: {
        fieldUpdates = {
          intents: [action.intent],
        };

        break;
      }

      case actionTypes.CLEAR_INTENTS: {
        fieldUpdates = {
          intents: [],
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
  }
}

const formActionReducer = createFormActionReducer();
export default formActionReducer;