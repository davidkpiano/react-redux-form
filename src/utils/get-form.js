import get from '../utils/get';
import isPlainObject from 'lodash/isPlainObject';
import pathStartsWith, { pathDifference } from '../utils/path-starts-with';

const defaultStrategy = {
  get,
  keys: (state) => Object.keys(state),
  isObject: (state) => isPlainObject(state),
};

function joinPaths(...paths) {
  return paths.filter(path => !!path && path.length).join('.');
}

export function getFormStateKey(state, model, s = defaultStrategy, currentPath = '') {
  const deepCandidateKeys = [];
  let result = null;

  s.keys(state).some((key) => {
    const subState = s.get(state, key);

    if (subState && s.get(subState, '$form')) {
      const subStateModel = s.get(subState, '$form.model');

      if (pathStartsWith(model, subStateModel) || subStateModel === '') {
        const localPath = pathDifference(model, subStateModel);

        const resultPath = [currentPath, key];
        let currentState = subState;

        localPath.every((segment) => {
          if (s.get(currentState, segment) && s.get(currentState, `${segment}.$form`)) {
            currentState = s.get(currentState, segment);
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

    if (s.isObject(subState)) {
      deepCandidateKeys.push(key);
    }

    return false;
  });

  if (result) return result;

  deepCandidateKeys.some((key) => {
    result = getFormStateKey(s.get(state, key), model, s, joinPaths(currentPath, key));

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
