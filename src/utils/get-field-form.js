import get from './get';

const defaultStrategies = {
	get
}

export default function getFieldForm(state, path, s = defaultStrategies) {
  const formPath = path.slice(0, -1);

  if (!formPath.length) return state;

  return s.get(state, formPath);
}
