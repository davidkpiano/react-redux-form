import get from 'lodash/get';
import set from 'lodash/set';
import startsWith from 'lodash/startsWith';
import cloneDeep from 'lodash/cloneDeep';
import isPlainObject from 'lodash/isPlainObject';
import isBoolean from 'lodash/isBoolean';
import mapValues from 'lodash/mapValues';
import every from 'lodash/every';

import * as actionTypes from '../action-types';

function setField(state, model, props) {
  if (state.model === model) {
    return Object.assign(state, props);
  };

  return set(state, ['fields', model], {
    ...initialFieldState,
    ...get(state, ['fields', model]),
    ...props
  });
}

function getField(state, field, model) {
  return get(
    state,
    ['fields', `${model}.${field}`],
    get(
      state,
      ['fields', field], initialFieldState));
}

const initialFieldState = {
  viewValue: null,
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
  ...initialFieldState,
  fields: {},
  field: () => initialFieldState
};

function createFormReducer(model) {
  return (state = initialFormState, action) => {
    if (!startsWith(action.model, model)) {
      return state;
    }

    console.log(action);

    let form = cloneDeep({
      ...state,
      model: model
    });

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

        Object.assign(form, {
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
          : !action.validity;

        setField(form, action.model, {
          errors: errors,
          valid: isBoolean(errors)
            ? errors
            : every(errors, (error) => !error)
        });

        Object.assign(form, {
          valid: every(mapValues(form.fields, (field) => field.valid))
            && every(form.errors, (error) => !error)
        });

        break;

      case actionTypes.SET_PRISTINE:
        setField(form, action.model, {
          dirty: false,
          pristine: true
        });

        let formIsPristine = every(mapValues(form.fields, (field) => field.pristine));

        Object.assign(form, {
          pristine: formIsPristine,
          dirty: !formIsPristine
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
      case actionTypes.RESET:
        setField(form, action.model, initialFieldState);

        break;

      case actionTypes.SET_VIEW_VALUE:
        setField(form, action.model, {
          viewValue: action.value
        });

      default:
        break;
    }

    return {
      ...form,
      field: (field) => getField(form, field, model)
    }
  }
}

export {
  createFormReducer,
  initialFieldState,
  initialFormState
}
