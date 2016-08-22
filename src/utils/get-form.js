import get from '../utils/get';
import isPlainObject from 'lodash/isPlainObject';
import pathStartsWith from '../utils/path-starts-with';

function joinPaths(firstPath, secondPath) {
  if (!firstPath || !firstPath.length) return secondPath;

  return `${firstPath}.${secondPath}`;
}

export function getFormStateKey(state, model, currentPath = '') {
  const deepCandidateKeys = [];
  let result = null;

  Object.keys(state).some((key) => {
    const subState = state[key];

    if (subState && subState.$form) {
      if (subState.$form.model === '') {
        return Object.keys(subState).some((formKey) => {
          const formState = subState[formKey];

          if (formKey === '$form') return false;

          if (!formState.$form) return false;

          if (pathStartsWith(model, joinPaths(currentPath, formState.$form.model))) {
            result = currentPath
              ? [currentPath, key, formKey].join('.')
              : [key, formKey].join('.');

            return true;
          }

          return false;
        });
      }

      if (pathStartsWith(model, subState.$form.model)) {
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

let formStateKeyCache = {};

const getFormStateKeyCached = (() => (state, modelString) => {
  if (formStateKeyCache[modelString]) return formStateKeyCache[modelString];

  const result = getFormStateKey(state, modelString);

  formStateKeyCache[modelString] = result; // eslint-disable-line no-return-assign

  return result;
})();

function getForm(state, modelString) {
  const formStateKey = getFormStateKeyCached(state, modelString);

  if (!formStateKey) {
    return null;
  }

  return get(state, formStateKey);
}

getForm.clearCache = () => formStateKeyCache = {}; // eslint-disable-line no-return-assign

export default getForm;
