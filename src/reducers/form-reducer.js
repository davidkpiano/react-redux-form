import _get from 'lodash/get';
import every from 'lodash/every';
import icepick from 'icepick';
import isBoolean from 'lodash/isBoolean';
import isEqual from 'lodash/isEqual';
import isPlainObject from 'lodash/isPlainObject';
import mapValues from 'lodash/mapValues';
import toPath from 'lodash/toPath';
import flatten from 'flat';

import actionTypes from '../action-types';
import { isValid } from '../utils';

const initialFieldState = {
  blur: true,
  dirty: false,
  focus: false,
  pending: false,
  pristine: true,
  submitted: false,
  touched: false,
  untouched: true,
  valid: true,
  validating: false,
  viewValue: null,
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

function createFormer(
  getter = getField, setter = setField, resetter = resetField,
  _initialFormState = initialFormState, _createInitialFormState = createInitialFormState
) {
  return function _createFormReducer(model, initialState = _initialFormState) {
    const modelPath = toPath(model);

    return (state = _createInitialFormState(model, initialState), action) => {
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
        case actionTypes.FOCUS:
          return setter(state, localPath, {
            blur: false,
            focus: true,
          });

        case actionTypes.CHANGE:
        case actionTypes.SET_DIRTY: {
          const setDirtyState = icepick.merge(state, {
            dirty: true,
            pristine: false,
            touched: true,
          });

          return setter(setDirtyState, localPath, {
            dirty: true,
            pristine: false,
            touched: true,
          });
        }

        case actionTypes.BLUR:
        case actionTypes.SET_TOUCHED: {
          const fieldState = setter(state, localPath, {
            blur: true,
            focus: false,
            touched: true,
            untouched: false,
          });

          return icepick.merge(fieldState, {
            touched: true,
            untouched: false,
          });
        }

        case actionTypes.SET_PENDING:
          return setter(state, localPath, {
            pending: action.pending,
            submitted: false,
          });

        case actionTypes.SET_VALIDITY: {
          if (isPlainObject(action.validity)) {
            validity = icepick.merge(
              getter(state, localPath).validity,
              action.validity
            );

            errors = {
              ...getter(state, localPath).errors,
              ...mapValues(action.validity, valid => !valid),
            };
          } else {
            validity = action.validity;
            errors = !action.validity;
          }

          const formIsValidState = setter(state, localPath, {
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
              ...getter(state, localPath).validity,
              ...mapValues(action.errors, error => !error),
            };

            errors = icepick.merge(
              getter(state, localPath).errors,
              action.errors
            );
          } else {
            validity = !action.errors;
            errors = action.errors;
          }

          const setErrorsState = setter(state, localPath, {
            errors,
            validity,
            valid: isValid(validity),
          });

          return icepick.merge(setErrorsState, {
            valid: formIsValid(setErrorsState),
          });
        }

        case actionTypes.RESET_VALIDITY: {
          let resetValidityState = icepick.setIn(
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
                dirty: false,
                pristine: true,
              })),
            });
          } else {
            setPristineState = setter(state, localPath, {
              dirty: false,
              pristine: true,
            });

            formIsPristine = every(mapValues(setPristineState.fields, field => field.pristine));
          }

          return icepick.merge(setPristineState, {
            dirty: !formIsPristine,
            pristine: formIsPristine,
          });
        }

        case actionTypes.SET_UNTOUCHED:
          return setter(state, localPath, {
            touched: false,
            untouched: true,
          });

        case actionTypes.SET_SUBMITTED:
          return setter(state, localPath, {
            pending: false,
            submitted: !!action.submitted,
            touched: true,
          });

        case actionTypes.SET_INITIAL:
        case actionTypes.RESET:
          return resetter(state, localPath);

        case actionTypes.SET_VIEW_VALUE:
          return setter(state, localPath, {
            viewValue: action.value,
          });

        default:
          return state;
      }
    };
  };
}

const formReducer = createFormer();

function createFormReducer(...args) {
  console.warn('The createFormReducer() function is deprecated (renamed). '
    + 'Please use formReducer().');

  return formReducer(...args);
}

export {
  createFormer,
  createFormReducer,
  formReducer,
  initialFieldState,
  initialFormState,
  getField,
};
