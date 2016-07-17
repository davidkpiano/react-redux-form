import { createModeler } from '../reducers/model-reducer';
import { createModelReducerEnhancer } from '../enhancers/modeled-enhancer';

function immutableGet(state, path, defaultValue) {
  try {
    return state.getIn(path, defaultValue);
  } catch (error) {
    throw new Error(`Unable to retrieve path '${path.join(
      '.')}' in state. Please make sure that state is an Immutable instance.`);
  }
}

function immutableSet(state, path, value) {
  try {
    return state.setIn(path, value);
  } catch (error) {
    throw new Error(`Unable to set path '${path.join(
      '.')}' in state. Please make sure that state is an Immutable instance.`);
  }
}

const modelReducer = createModeler(immutableGet, immutableSet);
const modelReducerEnhancer = createModelReducerEnhancer(modelReducer);

export {
  modelReducer,
  modelReducerEnhancer as modeled,
};
