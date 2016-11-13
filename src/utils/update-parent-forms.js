import i from 'icepick';
import get from './get';

export default function updateParentForms(state, localPath, updater) {
  const parentLocalPath = localPath.slice(0, -1);

  const value = parentLocalPath.length
    ? get(state, parentLocalPath)
    : state;

  if (!value) return state;

  const form = value.$form;

  const updatedValue = typeof updater === 'function'
    ? updater(value)
    : updater;

  const newState = i.setIn(state, [...parentLocalPath, '$form'], i.merge(form, updatedValue));

  if (!parentLocalPath.length) return newState;

  return updateParentForms(newState, parentLocalPath, updater);
}
