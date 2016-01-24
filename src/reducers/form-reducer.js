import get from 'lodash/get';
import set from 'lodash/set';
import merge from 'lodash/merge';
import toPath from 'lodash/toPath';
import isPlainObject from 'lodash/isPlainObject';
import isBoolean from 'lodash/isBoolean';
import mapValues from 'lodash/mapValues';
import every from 'lodash/every';
import cloneDeep from 'lodash/cloneDeep';

import * as actionTypes from '../action-types';

// Impure function! Use only inside formReducer for temporary state.
// The form reducer is still pure; this impure side-effectful
// function is to improve performance while doing deep updates to the
// form state.
function impureSetField(state, model, props) {
  if (state.model === model) {
    return merge(state, props);
  };

  return set(state, ['fields'].concat(model), props);
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
    let path = toPath(action.model);

    if (path[0] !== model) {
      return state;
    }

    let form = merge(cloneDeep(state), {
      model: model,
      field: (field) => getField(form, field, model)
    });

    switch (action.type) {
      case actionTypes.FOCUS:
        return impureSetField(form, action.model, {
          focus: true,
          blur: false
        });

      case actionTypes.CHANGE:
      case actionTypes.SET_DIRTY:
        merge(form, {
          dirty: true,
          pristine: false,
        });

        return impureSetField(form, action.model, {
          dirty: true,
          pristine: false
        });

      case actionTypes.BLUR:
      case actionTypes.SET_TOUCHED:
        return impureSetField(form, action.model, {
          touched: true,
          untouched: false,
          focus: false,
          blur: true
        });

      case actionTypes.SET_PENDING:
        return impureSetField(form, action.model, {
          pending: action.pending,
          submitted: false
        });

      case actionTypes.SET_VALIDITY:
        let errors = isPlainObject(action.validity)
          ? {
              ...getField(form, action.model).errors,
              ...mapValues(action.validity, (valid) => !valid)
            }
          : !action.validity;

        form = impureSetField(form, action.model, {
          errors: errors,
          valid: isBoolean(errors)
            ? errors
            : every(errors, (error) => !error)
        });

        return merge(form, {
          valid: every(mapValues(form.fields, (field) => field.valid))
            && every(form.errors, (error) => !error)
        });

        break;

      case actionTypes.SET_PRISTINE:
        form = impureSetField(form, action.model, {
          dirty: false,
          pristine: true
        });

        let formIsPristine = every(mapValues(form.fields, (field) => field.pristine));

        return merge(form, {
          pristine: formIsPristine,
          dirty: !formIsPristine
        });

      case actionTypes.SET_UNTOUCHED:
        return impureSetField(form, action.model, {
          touched: false,
          untouched: true
        });

      case actionTypes.SET_SUBMITTED:
        return impureSetField(form, action.model, {
          pending: false,
          submitted: !!action.submitted
        });

      case actionTypes.SET_INITIAL:
      case actionTypes.RESET:
        return impureSetField(form, action.model, initialFieldState);

      case actionTypes.SET_VIEW_VALUE:
        return impureSetField(form, action.model, {
          viewValue: action.value
        });

      default:
        return form;
    }
  }
}

export {
  createFormReducer,
  initialFieldState,
  initialFormState
}
