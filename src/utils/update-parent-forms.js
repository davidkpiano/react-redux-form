import i from 'icepick';
import get from './get';
import assocIn from './assoc-in';
// import { updateFieldState } from './create-field';

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

  // const updatedForm = updateFieldState(form, updatedValue);

  const newState = assocIn(state, [...parentLocalPath, '$form'], i.merge(form, updatedValue));

  if (!parentLocalPath.length) return newState;

  return updateParentForms(newState, parentLocalPath, updater);
}
