import endsWith from 'lodash/endsWith';
import mapValues from '../utils/map-values';
import isPlainObject from 'lodash/isPlainObject';
import every from 'lodash/every';
import some from 'lodash/some';
import findKey from 'lodash/findKey';
import _get from '../utils/get';
import toPath from '../utils/to-path';
import pathStartsWith from '../utils/path-starts-with';
import memoize from 'lodash/memoize';

import { getField, initialFieldState } from '../reducers/form-reducer';
import flatten from './flatten';

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
  if (!event.target) {
    if (!event.nativeEvent) {
      return undefined;
    }

    return event.nativeEvent.text;
  }

  if (event.target.multiple) {
    return [...event.target.selectedOptions].map(option => option.value);
  }

  return event.target.value;
}

function getValue(value) {
  return isEvent(value) ? getEventValue(value) : value;
}

function getFormStateKey(state, model) {
  const flatState = flatten(state);

  const formStateKey = findKey(flatState, (value) =>
    value && value.model && pathStartsWith(model, value.model));

  return formStateKey;
}

const formStateKeyCaches = {};

function getFormStateKeyCached(state, model) {
  if (!formStateKeyCaches.hasOwnProperty(model)) {
    formStateKeyCaches[model] = new memoize.Cache();
  }

  const cache = formStateKeyCaches[model];
  if (cache.has(state)) {
    return cache.get(state);
  }

  const formStateKey = getFormStateKey(state, model);
  cache.set(state, formStateKey);
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

function isValid(validity) {
  if (isPlainObject(validity)) {
    return every(validity, isValid);
  }

  return !!validity;
}

function isInvalid(errors) {
  if (isPlainObject(errors)) {
    return some(errors, isInvalid);
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
  isValid,
  isInvalid,
  getForm,
  getFieldFromState,
  invertValidators,
  invertValidity,
  getModelPath,
  pathStartsWith,
};
