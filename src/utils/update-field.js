import i from 'icepick';
import get from './get';
import mapValues from './map-values';
import { createInitialState } from '../reducers/form-reducer';

function assocIn(state, path, value, fn) {
  if (!fn) return i.assocIn(state, path, value);

  const key0 = path[0];

  if (path.length === 1) {
    return fn(i.assoc(state, key0, value));
  }

  return fn(i.assoc(state, key0, assocIn(state[key0] || {}, path.slice(1), value, fn)));
}

function tempInitialState(path) {
  if (path.length === 1) return { [path[0]]: null };

  return {
    [path[0]]: tempInitialState(path.slice(1)),
  };
}

export function getFieldAndForm(formState, modelPath) {
  let field = get(formState, modelPath);
  let form = formState;

  if (!field) {
    form = i.merge(createInitialState(
      formState.$form.model,
      tempInitialState(modelPath)), formState);

    field = get(form, modelPath);
  }

  return [field, form];
}

export default function updateField(state, path, newState, newSubState, updater) {
  const [field, fullState] = getFieldAndForm(state, path);

  const isForm = field.hasOwnProperty('$form');
  const fieldPath = isForm
    ? i.push(path, '$form')
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
        return i.assign(
          fieldState,
          updatedFieldState);
      }

      const updatedSubState = typeof newSubState === 'function'
        ? newSubState(subState, updatedFieldState)
        : newSubState;

      return i.assign(subState, updatedSubState);
    });

    if (!path.length) return formState;

    return assocIn(fullState, path, formState, updater);
  }

  return assocIn(fullState, fieldPath, i.assign(
    fieldState,
    updatedFieldState), updater);
}
