import _get from 'lodash/get';
import every from 'lodash/every';
import icepick from 'icepick';
import isBoolean from 'lodash/isBoolean';
import isEqual from 'lodash/isEqual';
import isPlainObject from 'lodash/isPlainObject';
import mapValues from 'lodash/mapValues';
import toPath from 'lodash/toPath';
import startsWith from 'lodash/startsWith';
import flatten from 'flat';

import actionTypes from '../action-types';
import { isValid } from '../utils';

const propInverses = {
  blur: 'focus',
  dirty: 'pristine',
  untouched: 'touched',
};

function deprecateProp(prop, result) {
  console.warn(`The .${prop} prop will be deprecated as of v1.0.`
    + `Please use the the inverse of .${propInverses[prop]} instead.`);

  return result;
}

const initialFieldState = {
  get blur() {
    return deprecateProp('blur', true);
  },
  get dirty() {
    return deprecateProp('dirty', false);
  },
  focus: false,
  pending: false,
  pristine: true,
  submitted: false,
  touched: false,
  get untouched() {
    return deprecateProp('untouched', true);
  },
  valid: true,
  validating: false,
  viewValue: null,
  validity: {},
  errors: {},
};

const initialFormState = {
  ...initialFieldState,
  fields: {},
  submitFailed: false,
  retouched: false,
};

function getField(state, path) {
  if (!isPlainObject(state) || !state.fields) {
    throw new Error(`Error when trying to retrieve field '${path}` +
      ' from an invalid/empty form state. Must pass in a valid form state as the first argument.');
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

function resetField(state, localPath) {
  if (!localPath.length) {
    return initialFormState;
  }

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

function removeDiff(state, newValue, localPath) {
  const localKeys = Object.keys(state.fields)
    .filter((fieldKey) => startsWith(fieldKey, localPath));

  let finalState = state;

  localKeys.forEach((localKey) => {
    if (typeof _get({ [localPath]: newValue }, localKey, undefined) === 'undefined') {
      finalState = icepick.updateIn(
        finalState,
        ['fields'],
        (obj) => icepick.dissoc(obj, localKey));
    }
  });

  return finalState;
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
          get blur() {
            return deprecateProp('blur', false);
          },
          focus: true,
        });

      case actionTypes.CHANGE: {
        const setDirtyState = icepick.merge(state, {
          get dirty() {
            return deprecateProp('dirty', true);
          },
          pristine: false,
        });

        return removeDiff(setField(setDirtyState, localPath, {
          get dirty() {
            return deprecateProp('dirty', true);
          },
          pristine: false,
        }), action.value, localPath);
      }

      case actionTypes.SET_DIRTY: {
        const setDirtyState = icepick.merge(state, {
          get dirty() {
            return deprecateProp('dirty', true);
          },
          pristine: false,
        });

        return setField(setDirtyState, localPath, {
          get dirty() {
            return deprecateProp('dirty', true);
          },
          pristine: false,
        });
      }

      case actionTypes.BLUR:
      case actionTypes.SET_TOUCHED: {
        const fieldState = setField(state, localPath, {
          get blur() {
            return deprecateProp('blur', true);
          },
          focus: false,
          touched: true,
          get untouched() {
            return deprecateProp('untouched', false);
          },
        });

        return icepick.merge(fieldState, {
          touched: true,
          get untouched() {
            return deprecateProp('untouched', false);
          },
        });
      }

      case actionTypes.SET_PENDING:
        return setField(state, localPath, {
          pending: action.pending,
          submitted: false,
          submitFailed: false,
        });

      case actionTypes.SET_VALIDITY: {
        if (isPlainObject(action.validity)) {
          validity = icepick.merge(
            getField(state, localPath).validity,
            action.validity
          );

          errors = {
            ...getField(state, localPath).errors,
            ...mapValues(action.validity, valid => !valid),
          };
        } else {
          validity = action.validity;
          errors = !action.validity;
        }

        const formIsValidState = setField(state, localPath, {
          errors,
          validity,
          valid: isBoolean(errors) ? !errors : every(errors, error => !error),
        });

        return icepick.merge(formIsValidState, {
          valid: formIsValid(formIsValidState),
        });
      }

      case actionTypes.SET_ERRORS: {
        if (isPlainObject(action.errors)) {
          validity = {
            ...getField(state, localPath).validity,
            ...mapValues(action.errors, error => !error),
          };

          errors = icepick.merge(
            getField(state, localPath).errors,
            action.errors
          );
        } else {
          validity = !action.errors;
          errors = action.errors;
        }

        const setErrorsState = setField(state, localPath, {
          errors,
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

        return resetValidityState;
      }

      case actionTypes.SET_PRISTINE: {
        let formIsPristine;
        let setPristineState;

        if (!localPath.length) {
          formIsPristine = true;

          setPristineState = icepick.merge(state, {
            fields: mapValues(state.fields, field => ({
              ...field,
              get dirty() {
                return deprecateProp('dirty', false);
              },
              pristine: true,
            })),
          });
        } else {
          setPristineState = setField(state, localPath, {
            get dirty() {
              return deprecateProp('dirty', false);
            },
            pristine: true,
          });

          formIsPristine = every(mapValues(setPristineState.fields, field => field.pristine));
        }

        return icepick.merge(setPristineState, {
          get dirty() {
            return deprecateProp('dirty', !formIsPristine);
          },
          pristine: formIsPristine,
        });
      }

      case actionTypes.SET_UNTOUCHED:
        return setField(state, localPath, {
          touched: false,
          get untouched() {
            return deprecateProp('untouched', true);
          },
        });

      case actionTypes.SET_SUBMITTED:
        return setField(state, localPath, {
          pending: false,
          submitted: !!action.submitted,
          submitFailed: false,
          touched: true,
          get untouched() {
            return deprecateProp('untouched', false);
          },
        });

      case actionTypes.SET_SUBMIT_FAILED:
        return setField(state, localPath, {
          pending: false,
          submitted: false,
          submitFailed: true,
          touched: true,
          get untouched() {
            return deprecateProp('untouched', false);
          },
        });

      case actionTypes.SET_INITIAL:
      case actionTypes.RESET:
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
  _createFormReducer as formReducer,
  initialFieldState,
  initialFormState,
  getField,
};
