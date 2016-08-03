import actionTypes from '../action-types';

function createBatchReducer(reducer, initialState) {
  return (state = initialState, action) => {
    if (action.type === actionTypes.BATCH) {
      return action.actions.reduce(reducer, state);
    }

    return reducer(state, action);
  };
}

export default createBatchReducer;
