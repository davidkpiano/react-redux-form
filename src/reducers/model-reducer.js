import get from 'lodash/object/get';
import set from 'lodash/object/set';
import startsWith from 'lodash/string/startsWith';
import cloneDeep from 'lodash/lang/cloneDeep';
import isArray from 'lodash/lang/isArray';
import toPath from 'lodash/internal/toPath';

import * as actionTypes from '../action-types';

function getSuperState(model, state) {
  return set(
    {},
    model,
    cloneDeep(state));
}

function createModelReducer(model, initialState = {}) {
  return (state = initialState, action) => {
    let path = toPath(action.model);

    if (path[0] !== model) {
      return state;
    }

    let superState = getSuperState(model, state);

    let collection = get(superState, action.model, []);

    switch (action.type) {
      case actionTypes.CHANGE:
        if (action.model === model) {
          return action.value;
        }

        set(superState, action.model, action.value);

        return get(superState, model);

      case actionTypes.RESET:
        set(superState, action.model, get(getSuperState(model, initialState), action.model));

        return get(superState, model);

      default:
        return state;
    }
  }
}

export {
  createModelReducer
}
