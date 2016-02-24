import every from 'lodash/every';
import _get from 'lodash/get';
import icepick from 'icepick';
import isBoolean from 'lodash/isBoolean';
import isEqual from 'lodash/isEqual';
import isPlainObject from 'lodash/isPlainObject';
import mapValues from 'lodash/mapValues';
import toPath from 'lodash/toPath';

import * as actionTypes from '../action-types';

function setField(state, localPath, props) {
  if (!localPath.length) {
    return icepick.merge(state, props);
  }

  return icepick.merge(state, {
    fields: {
      [localPath.join('.')]: {
        ...getField(state, localPath),
        ...props
      }
    }
  });
}

function resetField(state, localPath) {
  if (!localPath.length) {
    return initialFormState;
  }

  return icepick.setIn(state, [
    'fields',
    localPath.join('.')],
    initialFieldState
  );
}

function getField(state, path) {
  if (!isPlainObject(state) || !state.fields) {
    throw new Error(`Error when trying to retrieve field '${path}' from an invalid/empty form state. Must pass in a valid form state as the first argument.`);
  }

  const localPath = toPath(path);

  if (!localPath.length) {
    return state;
  }

  return _get(
    state,
    ['fields', localPath.join('.')],
    initialFieldState);
}

function formIsValid(formState) {
  return every(mapValues(formState.fields, (field) => field.valid))
    && every(formState.errors, (error) => !error);
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
  validity: {},
  errors: {}
};

const initialFormState = {
  ...initialFieldState,
  fields: {}
};

function createInitialFormState(model) {
  return {
    ...initialFormState,
    model
  };
}

function createFormReducer(model) {
  const modelPath = toPath(model);

  return (state = createInitialFormState(model), action) => {
    if (!action.model) return state;

    const path = toPath(action.model);

    if (!isEqual(path.slice(0, modelPath.length), modelPath)) {
      return state;
    }

    const localPath = path.slice(modelPath.length);
    let errors, validity;

    switch (action.type) {
      case actionTypes.FOCUS:
        return setField(state, localPath, {
          focus: true,
          blur: false
        });

      case actionTypes.CHANGE:
      case actionTypes.SET_DIRTY:
        state = icepick.merge(state, {
          dirty: true,
          pristine: false,
        });

        return setField(state, localPath, {
          dirty: true,
          pristine: false
        });

      case actionTypes.BLUR:
      case actionTypes.SET_TOUCHED:
        return setField(state, localPath, {
          touched: true,
          untouched: false,
          focus: false,
          blur: true
        });

      case actionTypes.SET_PENDING:
        return setField(state, localPath, {
          pending: action.pending,
          submitted: false
        });

      case actionTypes.SET_VALIDITY:
        if (isPlainObject(action.validity)) {
          errors = {
            ...getField(state, localPath).errors,
            ...mapValues(action.validity, (valid) => !valid)
          };

          validity = icepick.merge(
            getField(state, localPath).validity,
            action.validity);
        } else {
          validity = action.validity;
          
          errors = !action.validity;
        }

        state = setField(state, localPath, {
          errors,
          validity,
          valid: isBoolean(errors)
            ? !errors
            : every(errors, (error) => !error)
        });

        return icepick.merge(state, {
          valid: formIsValid(state)
        });

      case actionTypes.SET_ERRORS:
        if (isPlainObject(action.errors)) {
          validity = {
            ...getField(state, localPath).validity,
            ...mapValues(action.errors, (error) => !error)
          };

          errors = icepick.merge(
            getField(state, localPath).errors,
            action.errors);
        } else {
          validity = !action.errors;

          errors = action.errors;
        }

        state = setField(state, localPath, {
          errors,
          validity,
          valid: isBoolean(errors)
            ? !errors
            : every(errors, (error) => !error)
        });

        return icepick.merge(state, {
          valid: formIsValid(state)
        });

      case actionTypes.SET_PRISTINE:
        let formIsPristine;

        if (!localPath.length) {
          formIsPristine = true;

          state = icepick.merge(state, {
            fields: mapValues(state.fields, (field) => ({
              ...field,
              pristine: true,
              dirty: false
            }))
          });
        } else {        
          state = setField(state, localPath, {
            dirty: false,
            pristine: true
          });

          formIsPristine = every(mapValues(state.fields, (field) => field.pristine));
        }

        return icepick.merge(state, {
          pristine: formIsPristine,
          dirty: !formIsPristine
        });

      case actionTypes.SET_UNTOUCHED:
        return setField(state, localPath, {
          touched: false,
          untouched: true
        });

      case actionTypes.SET_SUBMITTED:
        return setField(state, localPath, {
          pending: false,
          submitted: !!action.submitted
        });

      case actionTypes.SET_INITIAL:
      case actionTypes.RESET:
        return resetField(state, localPath);

      case actionTypes.SET_VIEW_VALUE:
        return setField(state, localPath, {
          viewValue: action.value
        });

      default:
        return state;
    }
  };
}

export {
  createFormReducer,
  initialFieldState,
  initialFormState,
  getField
};
