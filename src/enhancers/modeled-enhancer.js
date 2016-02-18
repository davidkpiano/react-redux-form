import { createModelReducer } from '../reducers/model-reducer';

const NULL_ACTION = { type: null };

function createModelReducerEnhancer(modelReducerCreator = createModelReducer) {
  return function modelReducerEnhancer(reducer, model) {
    let initialState;
    
    try {
      initialState = reducer(undefined, NULL_ACTION);
    } catch (e) {
      initialState = null;
    }

    const modelReducer = modelReducerCreator(model, initialState);

    return (state = initialState, action) => {
      const updatedState = modelReducer(state, action);

      return reducer(updatedState, action);
    };
  }
}

const modelReducerEnhancer = createModelReducerEnhancer(createModelReducer);

export {
  modelReducerEnhancer as default,
  createModelReducerEnhancer
}
