import endsWith from 'lodash/endsWith';
import mapValues from '../utils/map-values';
import isPlainObject from 'lodash/isPlainObject';
import every from 'lodash/every';
import some from 'lodash/some';
import _get from '../utils/get';
import toPath from '../utils/to-path';
import pathStartsWith from '../utils/path-starts-with';
import memoize from 'lodash/memoize';

import { getField, initialFieldState } from '../reducers/form-reducer';

function isMulti(model) {
  return endsWith(model, '[]');
}

function isFocused(field) {
  return field && field.focus;
}

function isPristine(field) {
  return field ? field.pristine : initialFieldState.pristine;
}

function isTouched(field) {
  return field ? field.touched : initialFieldState.touched;
}

function isEvent(event) {
  return !!(event && event.stopPropagation && event.preventDefault);
}

function getEventValue(event) {
  const { target } = event;

  if (!target) {
    if (!event.nativeEvent) {
      return undefined;
    }

    return event.nativeEvent.text;
  }

  if (target.type === 'file') {
    return [...target.files]
      || (target.dataTransfer && [...target.dataTransfer.files]);
  }

  if (target.multiple) {
    return [...target.selectedOptions].map(option => option.value);
  }

  return target.value;
}

function getValue(value) {
  return isEvent(value) ? getEventValue(value) : value;
}

function getFormStateKey(state, model, currentPath = '') {
  const deepCandidateKeys = [];
  let result = null;

  Object.keys(state).some((key) => {
    const subState = state[key];

    if (subState && subState.model) {
      if (pathStartsWith(model, subState.model)) {
        result = currentPath
          ? [currentPath, key].join('.')
          : key;

        return true;
      }

      return false;
    }

    if (isPlainObject(subState)) {
      deepCandidateKeys.push(key);
    }

    return false;
  });

  if (result) return result;

  deepCandidateKeys.some((key) => {
    result = getFormStateKey(state[key], model,
      currentPath ? [currentPath, key].join('.') : key);

    return !!result;
  });

  if (result) return result;

  return null;
}

const formStateKeyCaches = {};

function getFormStateKeyCached(state, model) {
  if (!formStateKeyCaches.hasOwnProperty(model)) {
    formStateKeyCaches[model] = new memoize.Cache();
  }

  const cache = formStateKeyCaches[model];
  if (cache.has(model)) {
    return cache.get(model);
  }

  const formStateKey = getFormStateKey(state, model);
  cache.set(model, formStateKey);
  return formStateKey;
}

function getForm(state, model) {
  const formStateKey = getFormStateKeyCached(state, model);

  return _get(state, formStateKey);
}

function getFieldFromState(state, model) {
  const form = getForm(state, model);

  if (!form) return null;

  const formPath = toPath(form.model);
  const fieldPath = toPath(model).slice(formPath.length);

  return getField(form, fieldPath.length ? [fieldPath.join('.')] : []);
}

function getValidity(validators, value) {
  const modelValue = getValue(value);

  if (typeof validators === 'function') {
    return validators(modelValue);
  }

  return mapValues(validators, (validator) => getValidity(validator, modelValue));
}

function invertValidators(validators) {
  if (typeof validators === 'function') {
    return (val) => !validators(val);
  }

  return mapValues(validators, invertValidators);
}

function invertValidity(validity) {
  if (isPlainObject(validity)) {
    return mapValues(validity, invertValidity);
  }

  return !validity;
}

function isValidityValid(validity) {
  if (isPlainObject(validity)) {
    return every(validity, isValidityValid);
  }

  return !!validity;
}

function isValidityInvalid(errors) {
  if (isPlainObject(errors)) {
    return some(errors, isValidityInvalid);
  }

  return !!errors;
}

function getModelPath(model, field = '') {
  return field.length
    ? `${model}.${field}`
    : model;
}

export {
  isFocused,
  isMulti,
  isPristine,
  isTouched,
  getEventValue,
  getValue,
  getValidity,
  isValidityValid,
  isValidityInvalid,
  getForm,
  getFieldFromState,
  invertValidators,
  invertValidity,
  getModelPath,
  pathStartsWith,
  getFormStateKey,
};
