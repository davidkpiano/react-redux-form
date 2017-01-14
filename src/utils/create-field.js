import initialFieldState from '../constants/initial-field-state';
import isPlainObject from './is-plain-object';

/* eslint-disable no-use-before-define */
function fieldOrForm(model, value, customInitialFieldState) {
  if (Array.isArray(value) || isPlainObject(value)) {
    return createFormState(model, value, customInitialFieldState);
  }

  return createFieldState(model, value, customInitialFieldState);
}
/* eslint-enable no-use-before-define */

function getSubModelString(model, subModel) {
  if (!model) return subModel;

  return `${model}.${subModel}`;
}

export default function createFieldState(model, value, customInitialFieldState) {
  return {
    ...initialFieldState,
    ...customInitialFieldState,
    model,
    value,
    initialValue: value,
  };
}

export function createFormState(model, values, customInitialFieldState, options = {}) {
  const state = {};

  state.$form = createFieldState(model, values, customInitialFieldState);

  if (options.lazy) return state;

  Object.keys(values).forEach((key) => {
    const value = values[key];
    const subModel = getSubModelString(model, key);

    state[key] = fieldOrForm(subModel, value, customInitialFieldState);
  });

  return state;
}
