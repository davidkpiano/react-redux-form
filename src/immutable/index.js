import { createModeler } from '../reducers/model-reducer';
import { createModelReducerEnhancer } from '../enhancers/modeled-enhancer';
import toPath from 'lodash/toPath';

function immutableGet(state, path, defaultValue) {
  try {
    return state.getIn(path, defaultValue);
  } catch (e) {
    throw new Error(`Unable to retrieve path '${path.join('.')}' in state. Please make sure that state is an Immutable instance.`);
  }
}

function immutableSet(state, path, value) {
  try {
    return state.setIn(path, value);
  } catch (e) {
    throw new Error(`Unable to set path '${path.join('.')}' in state. Please make sure that state is an Immutable instance.`);
  }
}

const createModelReducer = createModeler(immutableGet, immutableSet);

const modelReducerEnhancer = createModelReducerEnhancer(createModelReducer);

export {
  createModelReducer,
  modelReducerEnhancer as modeled
}
