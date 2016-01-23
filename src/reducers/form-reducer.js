import get from 'lodash/get';
import toPath from 'lodash/toPath';
import isPlainObject from 'lodash/isPlainObject';
import isBoolean from 'lodash/isBoolean';
import mapValues from 'lodash/mapValues';
import every from 'lodash/every';
import Immutable from 'seamless-immutable';

import * as actionTypes from '../action-types';

function setField(state, model, props) {
  if (state.model === model) {
    return Immutable(state).merge(props);
  };

  return Immutable(state).merge({
    fields: {
      [model]: props
    }
  }, { deep: true });
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

    let form = Immutable({
      ...state,
      model: model,
      field: (field) => getField(form, field, model)
    });

    switch (action.type) {
      case actionTypes.FOCUS:
        form = setField(form, action.model, {
          focus: true,
          blur: false
        });

        break;

      case actionTypes.CHANGE:
      case actionTypes.SET_DIRTY:
        form = form.merge({
          dirty: true,
          pristine: false
        });

        form = setField(form, action.model, {
          dirty: true,
          pristine: false
        });

        break;

      case actionTypes.BLUR:
      case actionTypes.SET_TOUCHED:
        form = setField(form, action.model, {
          touched: true,
          untouched: false,
          focus: false,
          blur: true
        });

        break;

      case actionTypes.SET_PENDING:
        form = setField(form, action.model, {
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

        form = setField(form, action.model, {
          errors: errors,
          valid: isBoolean(errors)
            ? errors
            : every(errors, (error) => !error)
        });

        form = form.merge({
          valid: every(mapValues(form.fields, (field) => field.valid))
            && every(form.errors, (error) => !error)
        });

        break;

      case actionTypes.SET_PRISTINE:
        form = setField(form, action.model, {
          dirty: false,
          pristine: true
        });

        let formIsPristine = every(mapValues(form.fields, (field) => field.pristine));

        form = form.merge({
          pristine: formIsPristine,
          dirty: !formIsPristine
        });

        break;

      case actionTypes.SET_UNTOUCHED:
        form = setField(form, action.model, {
          touched: false,
          untouched: true
        });

        break;

      case actionTypes.SET_SUBMITTED:
        form = setField(form, action.model, {
          pending: false,
          submitted: !!action.submitted
        });

        break;

      case actionTypes.SET_INITIAL:
      case actionTypes.RESET:
        form = setField(form, action.model, initialFieldState);

        break;

      case actionTypes.SET_VIEW_VALUE:
        form = setField(form, action.model, {
          viewValue: action.value
        });

      default:
        break;
    }

    return form;
  }
}

export {
  createFormReducer,
  initialFieldState,
  initialFormState
}
