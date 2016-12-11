import get from './get';
import toPath from './to-path';
import getForm from './get-form';
import isPlainObject from './is-plain-object';
import invariant from 'invariant';

const defaultStrategy = {
  getForm,
};

export default function getFieldFromState(state, modelString, s = defaultStrategy) {
  const form = (state && '$form' in state)
    ? state
    : s.getForm(state, modelString);

  if (!form) return null;

  if (!modelString.length) return form;

  invariant(form,
    'Could not find form for "%s" in the store.',
    modelString);

  const formPath = toPath(form.$form.model);
  const fieldPath = toPath(modelString).slice(formPath.length);
  const field = get(form, fieldPath);

  if (!field) return null;
  if (isPlainObject(field) && '$form' in field) return field.$form;

  return field;
}
