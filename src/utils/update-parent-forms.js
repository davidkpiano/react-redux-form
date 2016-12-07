import i from 'icepick';
import get from './get';

const defaultStrategies = {
  get,
  setIn: i.setIn,
  mergeDeep: i.merge,
};

export default function updateParentForms(state, localPath, updater, s = defaultStrategies) {
  const parentLocalPath = localPath.slice(0, -1);

  const value = parentLocalPath.length
    ? s.get(state, parentLocalPath)
    : state;

  if (!value) return state;

  const form = s.get(value, '$form');

  const updatedValue = typeof updater === 'function'
    ? updater(value)
    : updater;

  const newState = s.setIn(state, [...parentLocalPath, '$form'], s.mergeDeep(form, updatedValue));

  if (!parentLocalPath.length) return newState;

  return updateParentForms(newState, parentLocalPath, updater, s);
}
