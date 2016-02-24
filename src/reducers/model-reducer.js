import _get from 'lodash/get';
import icepick from 'icepick';
import isEqual from 'lodash/isEqual';
import toPath from 'lodash/toPath';

import * as actionTypes from '../action-types';

function icepickSet(state, path, value) {
  return icepick.setIn(state, path, value);
}

function createModeler(getter = _get, setter = icepickSet, initialModelState = {}) {
  return function createModelReducer(model, initialState = initialModelState) {
    const modelPath = toPath(model);

    return (state = initialState, action) => {
      if (!action.model) return state;

      const path = toPath(action.model);

      if (!isEqual(path.slice(0, modelPath.length), modelPath)) {
        return state;
      }

      const localPath = path.slice(modelPath.length);

      switch (action.type) {
        case actionTypes.CHANGE:
          if (!localPath.length) {
            return action.value;
          }

          if (isEqual(getter(state, localPath), action.value)) {
            return state;
          }

          return setter(state, localPath, action.value);

        case actionTypes.RESET:
          if (!localPath.length) {
            return initialState;
          }

          if (isEqual(getter(state, localPath), getter(initialState, localPath))) {
            return state;
          }

          return setter(
            state,
            localPath,
            getter(initialState, localPath));

        default:
          return state;
      }
    }
  }
}

const createModelReducer = createModeler();

export {
  createModeler,
  createModelReducer
};
