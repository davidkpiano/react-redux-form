import get from './get';

export default function getFieldForm(state, path) {
  const formPath = path.slice(0, -1);

  if (!formPath.length) return state;

  return get(state, formPath);
}
