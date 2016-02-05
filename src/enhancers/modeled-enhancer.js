import { createModelReducer } from '../reducers/model-reducer';

const NULL_ACTION = { type: null };

function modeled(reducer, model) {
  let initialState;
  try {
    initialState = reducer(undefined, NULL_ACTION);
  } catch (e) {
    initialState = null;
  }

  const modelReducer = createModelReducer(model, initialState);

  return (state = initialState, action) => {
    const updatedState = modelReducer(state, action);

    return reducer(updatedState, action);
  };
}

export default modeled;
