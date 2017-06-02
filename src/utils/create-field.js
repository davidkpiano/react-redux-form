import initialFieldState from '../constants/initial-field-state';
import isPlainObject from './is-plain-object';
import mapValues from './map-values';

/* eslint-disable no-use-before-define */
export function fieldOrForm(model, value, customInitialFieldState) {
  // TODO: create toModel()
  const stringModel = Array.isArray(model)
    ? model.join('.')
    : model;

  if (Array.isArray(value) || isPlainObject(value)) {
    return createFormState(stringModel, value, customInitialFieldState);
  }

  return createFieldState(stringModel, value, customInitialFieldState);
}
/* eslint-enable no-use-before-define */

export function getMeta(fieldLike, prop) {
  if (fieldLike && fieldLike.$form) return fieldLike.$form[prop];

  return fieldLike[prop];
}

function getSubModelString(model, subModel) {
  if (!model) return subModel;

  return `${model}.${subModel}`;
}

export function updateFieldState(existingFieldState, updatedFieldState) {
  const newField = {
    ...existingFieldState,
    ...updatedFieldState,
  };

  return newField;
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
  return {
    $form: createFieldState(model, values, customInitialFieldState, options),
    ...(options.lazy
      ? undefined
      : mapValues(values, (value, key) => {
        const subModel = getSubModelString(model, key);

        return fieldOrForm(subModel, value, customInitialFieldState);
      })),
  };
}
