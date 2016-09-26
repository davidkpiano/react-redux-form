import actionTypes from '../action-types';

function createBatchReducer(reducer, initialState, options = {}) {
  const { transformAction } = options;

  return (state = initialState, action) => {
    const transformedAction = transformAction
      ? transformAction(action)
      : action;

    if (transformedAction.type === actionTypes.BATCH) {
      return transformedAction.actions.reduce(reducer, state);
    }

    return reducer(state, transformedAction);
  };
}

export default createBatchReducer;
