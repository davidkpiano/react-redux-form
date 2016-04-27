import endsWith from 'lodash/endsWith';
import mapValues from 'lodash/mapValues';
import isPlainObject from 'lodash/isPlainObject';
import every from 'lodash/every';
import some from 'lodash/some';
import findKey from 'lodash/findKey';
import get from 'lodash/get';
import toPath from 'lodash/toPath';
import startsWith from 'lodash/startsWith';
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

const getFormStateKey = memoize((state, model) => {
  const flatState = flatten(state);

  const formStateKey = findKey(flatState, (value) =>
    value.model && startsWith(model, value.model));

  return formStateKey;
});

function getForm(state, model) {
  const formStateKey = getFormStateKey(state, model);

  return get(state, formStateKey);
}

function getFieldFromState(state, model) {
  const form = getForm(state, model);

  if (!form) return null;

  return getField(form, toPath(model).slice(1));
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
};
