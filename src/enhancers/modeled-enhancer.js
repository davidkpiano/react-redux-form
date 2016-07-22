import modelReducer from '../reducers/model-reducer';
import NULL_ACTION from '../constants/null-action';

function createModelReducerEnhancer(modelReducerCreator = modelReducer) {
  return function modelReducerEnhancer(reducer, model) {
    let initialState;
    try {
      initialState = reducer(undefined, NULL_ACTION);
    } catch (error) {
      initialState = null;
    }

    const _modelReducer = modelReducerCreator(model, initialState);

    return (state = initialState, action) => {
      const updatedState = _modelReducer(state, action);

      return reducer(updatedState, action);
    };
  };
}

const modelReducerEnhancer = createModelReducerEnhancer(modelReducer);

export { createModelReducerEnhancer };
export default modelReducerEnhancer;
