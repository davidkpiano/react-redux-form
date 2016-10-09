import defaultGet from '../utils/get';
import isPlainObject from 'lodash/isPlainObject';
import pathStartsWith, { pathDifference } from '../utils/path-starts-with';

function joinPaths(...paths) {
  return paths.filter(path => !!path && path.length).join('.');
}

export function getFormStateKey(state, model, currentPath = '') {
  const deepCandidateKeys = [];
  let result = null;

  Object.keys(state).some((key) => {
    const subState = state[key];

    if (subState && subState.$form) {
      if (pathStartsWith(model, subState.$form.model) || subState.$form.model === '') {
        const localPath = pathDifference(model, subState.$form.model);

        const resultPath = [currentPath, key];
        let currentState = subState;

        localPath.every((segment) => {
          if (currentState[segment] && currentState[segment].$form) {
            currentState = currentState[segment];
            resultPath.push(segment);

            return true;
          }

          return false;
        });

        result = joinPaths(...resultPath);

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
    result = getFormStateKey(state[key], model, joinPaths(currentPath, key));

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

function getForm(state, modelString, get = defaultGet) {
  const formStateKey = getFormStateKeyCached(state, modelString);

  if (!formStateKey) {
    return null;
  }

  return get(state, formStateKey);
}

getForm.clearCache = () => formStateKeyCache = {}; // eslint-disable-line no-return-assign

export default getForm;
