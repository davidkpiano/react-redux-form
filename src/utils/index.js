
import { initialFieldState } from '../reducers/form-reducer';

import endsWith from 'lodash/endsWith';

function isMulti(model) {
  return endsWith(model, '[]');
}

function isFocused(field) {
  return field && field.focus;
}

function isPristine(field) {
  return field
    ? field.pristine
    : initialFieldState.pristine;
}

function isTouched(field) {
  return field
    ? field.touched
    : initialFieldState.touched;
}

function isEvent(event) {
  return !!(event && event.stopPropagation && event.preventDefault);
}

function getValue(value) {
  return isEvent(value)
    ? getEventValue(value)
    : value;
}

function getEventValue(event) {
  return event.target.multiple
    ? [...event.target.selectedOptions].map((option) => option.value)
    : event.target.value
}


export {
  isMulti,
  isFocused,
  isPristine,
  isTouched,
  getValue,
  getEventValue
}
