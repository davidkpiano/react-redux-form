import _get from '../utils/get';
import i from 'icepick';
import arraysEqual from '../utils/arrays-equal';
import toPath from '../utils/to-path';

import actionTypes from '../action-types';
import createBatchReducer from '../enhancers/batched-enhancer';

const defaultStrategy = {
  get: _get,
  setIn: i.setIn,
  object: {},
};

function createModeler(strategy = defaultStrategy) {
  const {
    get: getter,
    setIn: setter,
    object,
  } = strategy;

  return function _createModelReducer(model, initialState = object, options = {}) {
    const modelPath = toPath(model);

    const modelReducer = (state = initialState, action) => {
      if (!action.model) {
        return state;
      }

      const path = toPath(action.model);

      if (!arraysEqual(path.slice(0, modelPath.length), modelPath)) {
        return state;
      }

      const localPath = path.slice(modelPath.length);

      switch (action.type) {
        case actionTypes.CHANGE:
        case actionTypes.LOAD:
          if (!localPath.length) {
            return action.value;
          }

          if (getter(state, localPath) === action.value) {
            return state;
          }

          return setter(state, localPath, action.value);

        case actionTypes.RESET:
          if (!localPath.length) {
            return initialState;
          }

          if (getter(state, localPath) === getter(initialState, localPath)) {
            return state;
          }

          return setter(
            state,
            localPath,
            getter(initialState, localPath)
          );

        default:
          return state;
      }
    };

    return createBatchReducer(modelReducer, initialState, options);
  };
}

const modelReducer = createModeler();

export {
  createModeler,
};
export default modelReducer;
