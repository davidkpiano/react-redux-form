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
  return set(state, model, {
    ...initialFieldState,
    ...get(state, model),
    ...props
  });
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
  errors: {}
};

const initialFormState = {
  ...initialFieldState,
  fields: {},
  field: () => initialFieldState
};

function createFormReducer(model, initialState = initialFormState) {
  return (state = initialState, action) => {
    if (model && !startsWith(action.model, model)) {
      return state;
    }

    let superState = set(
      {},
      model,
      cloneDeep(state.fields)
    );

    let form = state;

    let collection = get(superState, action.model, []);

    switch (action.type) {
      case actionTypes.FOCUS:
        Object.assign(form, { focus: true, blur: false });
        setField(superState, action.model, { focus: true, blur: false });

        break;

      case actionTypes.CHANGE:
      case actionTypes.SET_DIRTY:
        setField(superState, action.model, { dirty: true, pristine: false });

        break;

      case actionTypes.BLUR:
      case actionTypes.SET_TOUCHED:
        setField(superState, action.model, {
          touched: true,
          untouched: false,
          focus: false,
          blur: true,
        });

        break;

      case actionTypes.SET_VALIDITY:
        let errors = isPlainObject(action.validity)
          ? {
              ...get(superState, action.model).errors,
              ...mapValues(action.validity, (valid) => !valid)
            }
          : action.validity;

        setField(superState, action.model, {
          errors,
          valid: isBoolean(errors)
            ? errors
            : every(errors, (error) => !!error)
        });

        break;

      case actionTypes.SET_PRISTINE:
        setField(superState, action.model, { dirty: false, pristine: true });

        break;

      case actionTypes.SET_UNTOUCHED:
        setField(superState, action.model, { touched: false, untouched: true });

        break;

      case actionTypes.SET_INITIAL:
      default:
        setField(superState, action.model, initialFieldState);

        break;
    }

    console.log('what the fuck');

    return {
      ...form,
      fields: get(superState, model),
      field: (model) => get(superState, model, initialFieldState)
    }
  }
}

export {
  createFormReducer,
  initialFieldState
}
