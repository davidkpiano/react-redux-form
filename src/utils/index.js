
import { initialFieldState } from '../reducers/form-reducer';

import endsWith from 'lodash/string/endsWith';

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

function getValue(event) {
  return isEvent(event)
    ? event.target.value
    : event;
}


export {
  isMulti,
  isFocused,
  isPristine,
  isTouched,
  getValue,
}
