import get from './get';
import invariant from 'invariant';

export default function getFieldForm(state, path) {
  const formPath = path.slice(0, -1);

  if (!formPath.length) return state;

  const form = get(state, formPath);

  invariant(form,
    'Could not find form for "%s" in the store.',
    formPath.join('.'));

  return form;
}
