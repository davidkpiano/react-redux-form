import get from 'lodash/get';
import icepick from 'icepick';
import isEqual from 'lodash/isEqual';
import toPath from 'lodash/toPath';

import * as actionTypes from '../action-types';

function createModelReducer(model, initialState = {}) {
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

        return icepick.setIn(state, localPath, action.value);

      case actionTypes.RESET:
        if (!localPath.length) {
          return initialState;
        }

        return icepick.setIn(
          state,
          localPath,
          get(initialState, localPath));

      default:
        return state;
    }
  };
}

export {
  createModelReducer
};
