
import { initialFieldState } from '../reducers/field-reducer';

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

export {
  isMulti,
  isFocused,
  isPristine,
  isTouched,
}
