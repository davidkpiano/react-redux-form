import get from './get';
import mapValues from './map-values';
import { updateFieldState, fieldOrForm } from './create-field';
import assocIn from './assoc-in';
import invariant from 'invariant';

export function getFieldAndForm(formState, modelPath) {
  let field = get(formState, modelPath);
  let form = formState;

  invariant(form,
    'Could not find form for "%s" in the store.',
    modelPath);

  if (!field) {
    const initialValue = get(formState.$form.initialValue, modelPath);
    const formModel = formState.$form.model;

    form = assocIn(formState, modelPath, fieldOrForm([formModel, ...modelPath], initialValue));

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
