import get from 'lodash/get';
import set from 'lodash/set';
import startsWith from 'lodash/startsWith';
import cloneDeep from 'lodash/cloneDeep';
import isArray from 'lodash/isArray';
import toPath from 'lodash/toPath';
import Immutable from 'seamless-immutable';

import * as actionTypes from '../action-types';

function createModelReducer(model, initialState = {}) {
  return (state = initialState, action) => {
    let path = toPath(action.model);

    if (path[0] !== model) {
      return state;
    }

    let localPath = path.slice(1);
    let immutableState = Immutable(state);

    switch (action.type) {
      case actionTypes.CHANGE:
        if (action.model === model) {
          return action.value;
        }

        return immutableState.setIn(
          localPath,
          action.value);

      case actionTypes.RESET:
        if (!localPath.length) {
          return initialState;
        }

        return immutableState.setIn(
          localPath,
          get(initialState, localPath));

      default:
        return immutableState;
    }
  }
}

export {
  createModelReducer
}
