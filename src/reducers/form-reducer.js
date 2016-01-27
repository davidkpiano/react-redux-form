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

function setField(state, localPath, props) {
  if (!localPath.length) {
    return merge(cloneDeep(state), props);
  };

  return merge(cloneDeep(state), {
    fields: {
      [localPath.join('.')]: {
        ...initialFieldState,
        ...props
      }
    }
  });
}

function getField(state, localPath, model) {
  return get(
    state,
    localPath.join('.'),
    initialFieldState);
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

    let localPath = path.slice(1);

    let form = cloneDeep(state);

    switch (action.type) {
      case actionTypes.FOCUS:
        return setField(form, localPath, {
          focus: true,
          blur: false
        });

      case actionTypes.CHANGE:
      case actionTypes.SET_DIRTY:
        merge(form, {
          dirty: true,
          pristine: false,
        });

        return setField(form, localPath, {
          dirty: true,
          pristine: false
        });

      case actionTypes.BLUR:
      case actionTypes.SET_TOUCHED:
        return setField(form, localPath, {
          touched: true,
          untouched: false,
          focus: false,
          blur: true
        });

      case actionTypes.SET_PENDING:
        return setField(form, localPath, {
          pending: action.pending,
          submitted: false
        });

      case actionTypes.SET_VALIDITY:
        let errors = isPlainObject(action.validity)
          ? {
              ...getField(form, localPath).errors,
              ...mapValues(action.validity, (valid) => !valid)
            }
          : !action.validity;

        form = setField(form, localPath, {
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
        form = setField(form, localPath, {
          dirty: false,
          pristine: true
        });

        let formIsPristine = every(mapValues(form.fields, (field) => field.pristine));

        return merge(form, {
          pristine: formIsPristine,
          dirty: !formIsPristine
        });

      case actionTypes.SET_UNTOUCHED:
        return setField(form, localPath, {
          touched: false,
          untouched: true
        });

      case actionTypes.SET_SUBMITTED:
        return setField(form, localPath, {
          pending: false,
          submitted: !!action.submitted
        });

      case actionTypes.SET_INITIAL:
      case actionTypes.RESET:
        return setField(form, localPath, initialFieldState);

      case actionTypes.SET_VIEW_VALUE:
        return setField(form, localPath, {
          viewValue: action.value
        });

      default:
        return form;
    }

    return merge(form, {
      model: model,
      field: (field) => getField(form, field, model)
    });
  }
}

export {
  createFormReducer,
  initialFieldState,
  initialFormState
}
