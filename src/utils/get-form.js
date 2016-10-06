import get from '../utils/get';
import isPlainObject from 'lodash/isPlainObject';
import pathStartsWith from '../utils/path-starts-with';


const defaultStrategy = {
  get,
  keys: (state) => Object.keys(state),
  isObject: (state) => isPlainObject(state),
};

function joinPaths(firstPath, secondPath) {
  if (!firstPath || !firstPath.length) return secondPath;

  return `${firstPath}.${secondPath}`;
}

export function getFormStateKey(state, model, s = defaultStrategy, currentPath = '') {
  const deepCandidateKeys = [];
  let result = null;

  s.keys(state).some((key) => {
    const subState = s.get(state, key);

    if (subState && s.get(subState, '$form')) {
      if (s.get(subState, '$form.model') === '') {
        return s.keys(subState).some((formKey) => {
          const formState = s.get(subState, formKey);

          if (formKey === '$form') return false;

          if (!s.get(formState, '$form')) return false;

          if (pathStartsWith(model, joinPaths(currentPath, s.get(formState, '$form.model')))) {
            result = currentPath
              ? [currentPath, key, formKey].join('.')
              : [key, formKey].join('.');

            return true;
          }

          return false;
        });
      }

      if (pathStartsWith(model, s.get(subState, '$form.model'))) {
        result = currentPath
          ? [currentPath, key].join('.')
          : key;

        return true;
      }

      return false;
    }

    if (s.isObject(subState)) {
      deepCandidateKeys.push(key);
    }

    return false;
  });

  if (result) return result;

  deepCandidateKeys.some((key) => {
    result = getFormStateKey(s.get(state, key), model, s,
      currentPath ? [currentPath, key].join('.') : key);

    return !!result;
  });

  if (result) return result;

  return null;
}

let formStateKeyCache = {};

export const clearGetFormCache =
  () => formStateKeyCache = {}; // eslint-disable-line no-return-assign

const getFormStateKeyCached = (() => (state, modelString, s = defaultStrategy) => {
  if (formStateKeyCache[modelString]) return formStateKeyCache[modelString];

  const result = getFormStateKey(state, modelString, s);

  formStateKeyCache[modelString] = result; // eslint-disable-line no-return-assign

  return result;
})();

function getForm(state, modelString, s = defaultStrategy) {
  const formStateKey = getFormStateKeyCached(state, modelString, s);

  if (!formStateKey) {
    return null;
  }

  return s.get(state, formStateKey);
}

export default getForm;
