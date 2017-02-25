import i from 'icepick';
import get from './get';
import mapValues from './map-values';
import { createInitialState } from '../reducers/form-reducer';
import { updateFieldState } from './create-field';
import identity from './identity';
import invariant from 'invariant';

function objClone(obj) {
  const keys = Object.keys(obj);
  const length = keys.length;
  const result = {};
  let index = 0;
  let key;

  for (; index < length; index += 1) {
    key = keys[index];
    result[key] = obj[key];
  }
  return result;
}

function assoc(state, key, value) {
  const newState = objClone(state);

  newState[key] = value;

  return newState;
}

function assocIn(state, path, value, fn = identity) {
  if (!path.length) return value;

  const key0 = path[0];

  if (path.length === 1) {
    return fn(assoc(state, key0, value));
  }

  return fn(assoc(state, key0, assocIn(state[key0] || {}, path.slice(1), value, fn)));
}

function tempInitialState(path, initialValue = null) {
  if (path.length === 1) return { [path[0]]: initialValue };

  return {
    [path[0]]: tempInitialState(path.slice(1), initialValue),
  };
}

export function getFieldAndForm(formState, modelPath) {
  let field = get(formState, modelPath);
  let form = formState;

  invariant(form,
    'Could not find form for "%s" in the store.',
    modelPath);

  if (!field) {
    const initialValue = get(formState.$form.initialValue, modelPath);

    form = i.merge(createInitialState(
      formState.$form.model,
      tempInitialState(modelPath, initialValue)), formState);

    field = get(form, modelPath);
  }

  return [field, form];
}

export default function updateField(state, path, newState, newSubState, updater) {
  const [field, fullState] = getFieldAndForm(state, path);

  if (!field) return state;

  const isForm = field.hasOwnProperty('$form');
  const fieldPath = isForm
    ? [...path, '$form']
    : path;

  const fieldState = isForm
    ? field.$form
    : field;

  const updatedFieldState = typeof newState === 'function'
    ? newState(fieldState)
    : newState;

  if (isForm && newSubState) {
    const formState = mapValues(field, (subState, key) => {
      if (key === '$form') {
        return updateFieldState(fieldState, updatedFieldState);
      }

      const updatedSubState = typeof newSubState === 'function'
        ? newSubState(subState, updatedFieldState)
        : newSubState;

      return updateFieldState(subState, updatedSubState);
    });

    if (!path.length) return formState;

    return assocIn(fullState, path, formState, updater);
  }

  return assocIn(fullState, fieldPath, updateFieldState(
    fieldState,
    updatedFieldState), updater);
}
