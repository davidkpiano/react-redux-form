import get from '../utils/get';
import isPlainObject from 'lodash/isPlainObject';
import pathStartsWith from '../utils/path-starts-with';
import { getForm as _oldGetForm } from '../utils/index';

function getFormStateKey(state, model, currentPath = '') {
  const deepCandidateKeys = [];
  let result = null;

  Object.keys(state).some((key) => {
    const subState = state[key];

    if (subState && subState.$form) {
      if (pathStartsWith(subState.$form.model, subState.model)) {
        result = currentPath
          ? [currentPath, key].join('.')
          : key;

        return true;
      }

      return false;
    }

    if (isPlainObject(subState)) {
      deepCandidateKeys.push(key);
    }

    return false;
  });

  if (result) return result;

  deepCandidateKeys.some((key) => {
    result = getFormStateKey(state[key], model,
      currentPath ? [currentPath, key].join('.') : key);

    return !!result;
  });

  if (result) return result;

  return null;
}

export default function getForm(state, modelString) {
  const formStateKey = getFormStateKey(state, modelString);

  if (!formStateKey) {
    return null;
  }

  return get(state, formStateKey);
}
