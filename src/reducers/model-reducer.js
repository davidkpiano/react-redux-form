import get from 'lodash/object/get';
import set from 'lodash/object/set';
import startsWith from 'lodash/string/startsWith';
import cloneDeep from 'lodash/lang/cloneDeep';
import isArray from 'lodash/lang/isArray';
import toPath from 'lodash/internal/toPath';
import Immutable from 'seamless-immutable';

import * as actionTypes from '../action-types';

function createModelReducer(model, initialState = {}) {
  return (state = initialState, action) => {
    let path = toPath(action.model);

    if (path[0] !== model) {
      return state;
    }

    let immutableState = Immutable(state);

    switch (action.type) {
      case actionTypes.CHANGE:
        if (action.model === model) {
          return action.value;
        }

        return immutableState.setIn(
          path.slice(1),
          action.value);

      case actionTypes.RESET:
        let localPath = path.slice(1);

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
