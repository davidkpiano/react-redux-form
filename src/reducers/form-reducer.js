import get from 'lodash/object/get';
import set from 'lodash/object/set';
import xor from 'lodash/array/xor';
import startsWith from 'lodash/string/startsWith';
import cloneDeep from 'lodash/lang/cloneDeep';
import isArray from 'lodash/lang/isArray';
import isPlainObject from 'lodash/lang/isPlainObject';
import isBoolean from 'lodash/lang/isBoolean';
import filter from 'lodash/collection/filter';
import map from 'lodash/collection/map';
import mapValues from 'lodash/object/mapValues';
import every from 'lodash/collection/every';

import * as actionTypes from '../action-types';

function setField(state, model, props) {
  return set(state, ['fields', model], {
    ...initialFieldState,
    ...get(state, ['fields', model]),
    ...props
  });
}

function getField(state, field, model) {
  let result = get(
    state,
    ['fields', `${model}.${field}`],
    get(
      state,
      ['fields', field], initialFieldState));

  return result;
}

const initialFieldState = {
  focus: false,
  blur: true,
  pristine: true,
  dirty: false,
  touched: false,
  untouched: true,
  valid: true,
  validating: false,
  pending: false,
  submitted: false,
  errors: {}
};

const initialFormState = {
  fields: {},
  field: () => initialFieldState
};

function createFormReducer(model, initialState = initialFormState) {
  return (state = initialState, action) => {
    
    if (model && !startsWith(action.model, model)) {
      return state;
    }

    let form = cloneDeep(state);

    switch (action.type) {
      case actionTypes.FOCUS:
        setField(form, action.model, {
          focus: true,
          blur: false
        });

        break;

      case actionTypes.CHANGE:
      case actionTypes.SET_DIRTY:
        setField(form, action.model, {
          dirty: true,
          pristine: false
        });

        break;

      case actionTypes.BLUR:
      case actionTypes.SET_TOUCHED:
        setField(form, action.model, {
          touched: true,
          untouched: false,
          focus: false,
          blur: true,
        });

        break;

      case actionTypes.SET_PENDING:
        setField(form, action.model, {
          pending: action.pending,
          submitted: false
        });

        break;

      case actionTypes.SET_VALIDITY:
        let errors = isPlainObject(action.validity)
          ? {
              ...getField(form, action.model).errors,
              ...mapValues(action.validity, (valid) => !valid)
            }
          : action.validity;

        setField(form, action.model, {
          errors: errors,
          valid: isBoolean(errors)
            ? errors
            : every(errors, (error) => !error)
        });

        break;

      case actionTypes.SET_PRISTINE:
        setField(form, action.model, {
          dirty: false,
          pristine: true
        });

        break;

      case actionTypes.SET_UNTOUCHED:
        setField(form, action.model, {
          touched: false,
          untouched: true
        });

        break;

      case actionTypes.SET_SUBMITTED:
        setField(form, action.model, {
          submitted: !!action.submitted
        });

        break;

      case actionTypes.SET_INITIAL:
      default:
        setField(form, action.model, initialFieldState);

        break;
    }

    return {
      ...form,
      field: (model) => getField(form, model)
    }
  }
}

export {
  createFormReducer,
  initialFieldState
}
