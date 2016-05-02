import _get from 'lodash/get';
import every from 'lodash/every';
import icepick from 'icepick';
import isBoolean from 'lodash/isBoolean';
import isEqual from 'lodash/isEqual';
import isPlainObject from 'lodash/isPlainObject';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
import toPath from 'lodash/toPath';
import startsWith from 'lodash/startsWith';
import flatten from 'flat';

import actionTypes from '../action-types';
import actions from '../actions/field-actions';
import { isValid } from '../utils';

const initialFieldState = {
  blur: true, // will be deprecated
  dirty: false, // will be deprecated
  focus: false,
  pending: false,
  pristine: true,
  submitted: false,
  submitFailed: false,
  retouched: false,
  touched: false,
  untouched: true, // will be deprecated
  valid: true,
  validating: false,
  viewValue: null,
  array: false,
  validity: {},
  errors: {},
};

const initialFormState = {
  ...initialFieldState,
  fields: {},
};

function getField(state, path) {
  if (!isPlainObject(state) || !state.fields) {
    throw new Error(`Error when trying to retrieve field '${path}` +
      ' from an invalid/empty form state. Must pass in a valid form state as the first argument.');
  }

  const localPath = typeof path === 'function'
    ? path(state)
    : toPath(path);

  if (!localPath.length) {
    return state;
  }

  return _get(
    state,
    ['fields', localPath.join('.')],
    initialFieldState);
}

function setField(state, localPath, props) {
  if (!localPath.length) {
    return icepick.merge(state, props);
  }

  return icepick.merge(state, {
    fields: {
      [localPath.join('.')]: {
        ...getField(state, localPath),
        ...props,
      },
    },
  });
}

function setInField(state, localPath, props) {
  if (!localPath.length) {
    return icepick.assign(state, props);
  }

  const field = getField(state, localPath);

  return icepick.setIn(
    state,
    ['fields', localPath.join('.')],
    icepick.assign(field, props));
}

function resetField(state, localPath) {
  return icepick.setIn(
    state,
    ['fields', localPath.join('.')],
    initialFieldState
  );
}

function formIsValid(formState) {
  return every(mapValues(formState.fields, field => field.valid))
    && every(formState.errors, error => !error);
}

function createInitialFormState(model, initialState) {
  const formState = icepick.set(initialFormState,
    'model', model);

  if (initialState) {
    return icepick.set(formState,
      'fields',
      mapValues(flatten(initialState), (initialValue) =>
        icepick.set(initialFieldState,
          'initialValue', initialValue))
    );
  }

  return formState;
}

function _createFormReducer(model, initialState) {
  const modelPath = toPath(model);
  const localInitialFormState = createInitialFormState(model, initialState);

  const formReducer = (state = localInitialFormState, action) => {
    if (!action.model) {
      return state;
    }

    const path = toPath(action.model);

    if (!isEqual(path.slice(0, modelPath.length), modelPath)) {
      return state;
    }

    const localPath = path.slice(modelPath.length);
    let errors;
    let validity;

    switch (action.type) {
      case actionTypes.BATCH:
        return action.actions.reduce(formReducer, state);

      case actionTypes.FOCUS:
        return setField(state, localPath, {
          blur: false, // will be deprecated
          focus: true,
          array: Array.isArray(action.value),
        });

      case actionTypes.CHANGE: {
        if (action.silent) return state;

        let setFieldDirtyState = setField(state, localPath, {
          dirty: true, // will be deprecated
          pristine: false,
          value: action.value,
        });

        if (action.removeKeys) {
          const persistKeys = [];

          const removeKeys = Object.keys(state.fields).filter((fieldKey) => {
            const localStringPath = localPath.join('.');

            for (const removeKey of action.removeKeys) {
              const removeKeyPath = `${localStringPath}.${removeKey}`;
              if (startsWith(fieldKey, removeKeyPath)) return true;
            }

            if (startsWith(fieldKey, `${localStringPath}.`)) {
              persistKeys.push(fieldKey);
            }

            return false;
          });

          removeKeys.forEach((removeKey) => {
            setFieldDirtyState = icepick.updateIn(
              setFieldDirtyState,
              ['fields'],
              (field) => icepick.dissoc(field, removeKey));
          });

          persistKeys.forEach((persistKey, index) => {
            const newPersistKeyPath = toPath(persistKey);
            newPersistKeyPath[localPath.length] = index;

            const persistField = getField(state, persistKey);

            // Remove old key
            setFieldDirtyState = icepick.updateIn(
              setFieldDirtyState,
              ['fields'],
              (field) => icepick.dissoc(field, persistKey));

            // Update field to new key
            setFieldDirtyState = setInField(
              setFieldDirtyState,
              newPersistKeyPath,
              persistField);
          });
        }

        return icepick.merge(setFieldDirtyState, {
          dirty: true, // will be deprecated
          pristine: false,
          valid: formIsValid(setFieldDirtyState),
        });
      }

      case actionTypes.SET_DIRTY: {
        const setDirtyState = icepick.merge(state, {
          dirty: true, // will be deprecated
          pristine: false,
        });

        return setField(setDirtyState, localPath, {
          dirty: true, // will be deprecated
          pristine: false,
        });
      }

      case actionTypes.BLUR:
      case actionTypes.SET_TOUCHED: {
        const fieldState = setField(state, localPath, {
          focus: false,
          touched: true,
          retouched: state.submitted || state.submitFailed,
          blur: true, // will be deprecated
          untouched: false, // will be deprecated
        });

        return icepick.merge(fieldState, {
          touched: true,
          retouched: state.submitted || state.submitFailed,
          untouched: false, // will be deprecated
        });
      }

      case actionTypes.SET_PENDING:
        return setField(state, localPath, {
          pending: action.pending,
          submitted: false,
          submitFailed: false,
          retouched: false,
        });

      case actionTypes.SET_VALIDITY: {
        if (isPlainObject(action.validity)) {
          errors = mapValues(action.validity, valid => !valid);
        } else {
          errors = !action.validity;
        }

        const formIsValidState = setInField(state, localPath, {
          errors,
          validity: action.validity,
          valid: isBoolean(errors) ? !errors : every(errors, error => !error),
        });

        return icepick.merge(formIsValidState, {
          valid: formIsValid(formIsValidState),
        });
      }

      case actionTypes.SET_FIELDS_VALIDITY:
        return map(action.fieldsValidity, (fieldValidity, field) =>
          actions.setValidity(`${model}.${field}`, fieldValidity, action.options)
        ).reduce(formReducer, state);

      case actionTypes.SET_ERRORS: {
        if (isPlainObject(action.errors)) {
          validity = mapValues(action.errors, error => !error);
        } else {
          validity = !action.errors;
        }

        const setErrorsState = setInField(state, localPath, {
          errors: action.errors,
          validity,
          valid: isValid(validity),
        });

        return icepick.merge(setErrorsState, {
          valid: formIsValid(setErrorsState),
        });
      }

      case actionTypes.RESET_VALIDITY: {
        let resetValidityState;
        if (!localPath.length) {
          resetValidityState = icepick.setIn(
            state,
            ['valid'],
            true);

          resetValidityState = icepick.setIn(
            resetValidityState,
            ['validity'],
            initialFieldState.validity);

          resetValidityState = icepick.setIn(
            resetValidityState,
            ['errors'],
            initialFieldState.errors);

          Object.keys(resetValidityState.fields).forEach((field) => {
            resetValidityState = icepick.setIn(
              resetValidityState,
              ['fields', field, 'valid'],
              true);

            resetValidityState = icepick.setIn(
              resetValidityState,
              ['fields', field, 'validity'],
              initialFieldState.validity);

            resetValidityState = icepick.setIn(
              resetValidityState,
              ['fields', field, 'errors'],
              initialFieldState.errors);
          });
        } else {
          resetValidityState = icepick.setIn(
            state,
            ['fields', localPath.join('.'), 'valid'],
            true
          );

          resetValidityState = icepick.setIn(
            resetValidityState,
            ['fields', localPath.join('.'), 'validity'],
            initialFieldState.validity
          );

          resetValidityState = icepick.setIn(
            resetValidityState,
            ['fields', localPath.join('.'), 'errors'],
            initialFieldState.errors
          );
        }

        return icepick.merge(resetValidityState, {
          valid: formIsValid(resetValidityState),
        });
      }

      case actionTypes.SET_PRISTINE: {
        let formIsPristine;
        let setPristineState;

        if (!localPath.length) {
          formIsPristine = true;

          setPristineState = icepick.merge(state, {
            fields: mapValues(state.fields, field => ({
              ...field,
              dirty: false, // will be deprecated
              pristine: true,
            })),
          });
        } else {
          setPristineState = setField(state, localPath, {
            dirty: false, // will be deprecated
            pristine: true,
          });

          formIsPristine = every(mapValues(setPristineState.fields, field => field.pristine));
        }

        return icepick.merge(setPristineState, {
          dirty: !formIsPristine, // will be deprecated
          pristine: formIsPristine,
        });
      }

      case actionTypes.SET_UNTOUCHED:
        return setField(state, localPath, {
          touched: false,
          untouched: true, // will be deprecated
        });

      case actionTypes.SET_SUBMITTED:
        return setField(state, localPath, {
          pending: false,
          submitted: !!action.submitted,
          submitFailed: false,
          touched: true,
          untouched: false, // will be deprecated
        });

      case actionTypes.SET_SUBMIT_FAILED:
        return setField(state, localPath, {
          pending: false,
          submitted: false,
          submitFailed: true,
          touched: true,
          untouched: false, // will be deprecated
        });

      case actionTypes.SET_INITIAL:
      case actionTypes.RESET:
        if (!localPath.length) {
          return localInitialFormState;
        }

        return resetField(state, localPath);

      case actionTypes.SET_VIEW_VALUE:
        return setField(state, localPath, {
          viewValue: action.value,
        });

      default:
        return state;
    }
  };

  return formReducer;
}

function createFormReducer(...args) {
  console.warn('The createFormReducer() function is deprecated (renamed). '
    + 'Please use formReducer().');
  /* eslint-disable */
  return _createformReducer(...args);
  /* eslint-enable */
}

export {
  createFormReducer,
  initialFieldState,
  initialFormState,
  getField,
};
export default _createFormReducer;
