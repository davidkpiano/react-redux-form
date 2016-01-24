import get from 'lodash/get';
import set from 'lodash/set';
import startsWith from 'lodash/startsWith';
import cloneDeep from 'lodash/cloneDeep';
import toPath from 'lodash/toPath';

import * as actionTypes from '../action-types';

function createModelReducer(model, initialState = {}) {
  return (state = initialState, action) => {
    let path = toPath(action.model);

    if (path[0] !== model) {
      return state;
    }

    let localPath = path.slice(1);
    let newState = cloneDeep(state);

    switch (action.type) {
      case actionTypes.CHANGE:
        if (!localPath.length) {
          return action.value;
        }

        return set(newState, localPath, action.value);

      case actionTypes.RESET:
        if (!localPath.length) {
          return initialState;
        }

        return set(
          newState,
          localPath,
          get(initialState, localPath));

      default:
        return newState;
    }
  }
}

export {
  createModelReducer
}
