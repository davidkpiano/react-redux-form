import get from './get';
import invariant from 'invariant';

const defaultStrategies = {
  get,
};

export default function getFieldForm(state, path, s = defaultStrategies) {
  const formPath = path.slice(0, -1);

  if (!formPath.length) return state;

  const form = s.get(state, formPath);

  invariant(form,
    'Could not find form for "%s" in the store.',
    formPath.join('.'));

  return form;
}
