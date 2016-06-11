/* eslint-disable */
import _get from '../utils/get';
import every from 'lodash/every';
import icepick from 'icepick';
import isBoolean from 'lodash/isBoolean';
import arraysEqual from '../utils/arrays-equal';
import isPlainObject from 'lodash/isPlainObject';
import isArray from 'lodash/isArray';
import map from 'lodash/map';
import mapValues from '../utils/map-values';
import compareKeys from '../utils/compare-keys';
import toPath from '../utils/to-path';
import pathStartsWith from '../utils/path-starts-with';
import compose from 'redux/lib/compose';
import composeReducers from '../utils/compose-reducers';
import identity from 'lodash/identity';

import actionTypes from '../action-types';
import actions from '../actions/field-actions';
import { isValid } from '../utils';

import changeActionReducer from './form/change-action-reducer';
import setValidityActionReducer from './form/set-validity-action-reducer';

export const initialFieldState = {
  focus: false,
  pending: false,
  pristine: true,
  submitted: false,
  submitFailed: false,
  retouched: false,
  touched: false,
  valid: true,
  validating: false,
  validated: false,
  viewValue: null,
  validity: {},
  errors: {},
};

export function getField(state, path) {
  if (process.env.NODE_ENV !== 'production') {
    if (!isPlainObject(state)) {
      throw new Error(`Could not retrieve field '${path}' `
        + `from an invalid/empty form state.`);
    }
  }

  return _get(state, path, initialFieldState);
}

function createInitialState(state) {
  let initialState;

  if (isArray(state)) {
    initialState = state.map(createInitialState);
  } else if (isPlainObject(state)) {  
    initialState = mapValues(state, createInitialState);
  } else {
    return icepick.merge(initialFieldState, {
      initialValue: state,
      value: state,
    });
  }

  const initialForm = icepick.merge(initialFieldState, {
    initialValue: state,
    value: state,
  });

  return icepick.set(initialState, '$form', initialForm);
}

function formIsValid(formState) {
  const formValid = formState.$form
    ? every(formState.$form.errors, error => !error)
    : true;

  return every(mapFields(formState, (field) => field.valid))
    && formValid;
}

function inverse(value) {
  return !value;
}

const reactions = {
  [actionTypes.FOCUS]: {
    form: () => ({ focus: true }),
    field: () => ({ focus: true }),
  },
  [actionTypes.SET_PRISTINE]: {
    form: () => ({ pristine: true }),
    field: () => ({ pristine: true }),
  },
  [actionTypes.SET_DIRTY]: {
    form: () => ({ pristine: false }),
    field: () => ({ pristine: false }),
  },
  [actionTypes.BLUR]: (state, action) => ({    
    form: (form) => ({
      focus: false,
      touched: true,
      retouched: !!(form.submitted || form.submitFailed),
      submitted: form.submitted,
    }),
    field: (_, form) => ({
      focus: false,
      touched: true,
      retouched: !!(form.submitted || form.submitFailed),
    }),
  }),
  [actionTypes.SET_TOUCHED]: (state, action) => reactions[actionTypes.BLUR](action, state),
  [actionTypes.SET_UNTOUCHED]: {
    form: (state) => state,
    field: () => ({
      touched: false,
    }),
  },
  [actionTypes.SET_PENDING]: (_, action) => ({
    form: () => ({
      pending: action.pending,
      retouched: false,
    }),
    field: () => ({
      pending: action.pending,
      submitted: false,
      submitFailed: false,
      retouched: false,
    }),
  }),
  [actionTypes.SET_ERRORS]: (_, action) => {
    const validity = isPlainObject(action.errors)
      ? mapValues(action.errors, inverse)
      : !action.errors;

    return {
      form: (_, fields) => ({
        valid: formIsValid(fields),
      }),
      field: () => ({
        errors: action.errors,
        validity,
        valid: isValid(validity),
        validated: true,
      }),
    };
  },
  [actionTypes.SET_SUBMITTED]: (_, action) => ({
    form: () => ({
      touched: true,
    }),
    field: () => ({
      pending: false,
      submitted: !!action.submitted,
      submitFailed: !action.submitted,
      touched: true,
      retouched: false,
    }),
  }),
  [actionTypes.SET_SUBMIT_FAILED]: (_, action) => {
    return {
      form: () => ({
        touched: true,
      }),
      field: (field) => ({
        pending: false,
        submitted: field.submitted && !action.submitFailed,
        submitFailed: !!action.submitFailed,
        touched: true,
        retouched: false,
      }),
      subField: (subField) => ({
        submitFailed: !!action.submitFailed,
        submitted: subField.submitted && !action.submitFailed,
        touched: true,
        retouched: false,
      }),
    }
  },
};

function getReaction(state, action) {
  const reaction = reactions[action.type];

  if (!reaction) return false;

  if (typeof reaction === 'function') {
    return reaction(state, action);
  }

  return reaction;
}

function mapFields(state, iterator) {
  if (Array.isArray(state)) {
    return state.map(iterator);
  }

  const result = mapValues(state, (field, fieldName) => {
    if (fieldName === '$form') return field;

    return iterator(field, state);
  });

  delete result.$form;

  return result;
}

function wrapFormReducer(plugin, modelPath, initialState) {
  return (state = initialState, action) => {
    if (!action.model) return state;

    const path = toPath(action.model);

    if (!arraysEqual(path.slice(0, modelPath.length), modelPath)) {
      return state;
    }

    const localPath = path.slice(modelPath.length);

    return plugin(state, action, localPath);
  }
}

function formActionReducer(state, action, _path) {
  const reaction = getReaction(state, action);

  const {
    form: formReaction = identity,
    field: fieldReaction = identity,
    subField: subFieldReaction = identity,
  } = reaction;

  if (!reaction) return state;

  const fieldFormPath = toPath(_path).slice(0, -1).concat(['$form']);
  const fieldFormState = _get(state, fieldFormPath);

  function recurse(subState = initialFieldState, path) {
    const [ parentKey = false, ...childPath ] = toPath(path);

    if (!parentKey && !childPath.length) {
      if (subState.hasOwnProperty('$form')) {
        return icepick.merge(subState, {
          $form: icepick.merge(
            subState.$form,
            fieldReaction(subState.$form, fieldFormState)),
          ...mapFields(subState, (subField) => icepick.merge(
            subField,
            subFieldReaction(subField, fieldFormState))),
        });
      }

      return icepick.merge(subState, fieldReaction(subState, fieldFormState));
    }

    const subFieldState = icepick.merge(subState, {
      [parentKey]: recurse(subState[parentKey], childPath),
    });

    return icepick.merge(subFieldState, {
      $form: icepick.merge(
        subFieldState.$form,
        formReaction(subFieldState.$form, subFieldState)),
    });
  }

  return recurse(state, _path);
}

const defaultPlugins = [changeActionReducer, setValidityActionReducer];

export default function createFormReducer(model, initialState = {}, plugins = []) {
  const modelPath = toPath(model);
  const initialFormState = createInitialState(initialState);

  const formReducer = wrapFormReducer(formActionReducer, modelPath, initialFormState);

  const wrappedPlugins = plugins.concat(defaultPlugins).map((plugin) => wrapFormReducer(plugin, modelPath, initialFormState));

  return composeReducers(...wrappedPlugins, formReducer);
}
/* eslint-enable */
