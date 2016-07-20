import { createModeler } from '../reducers/model-reducer';
import { createModelReducerEnhancer } from '../enhancers/modeled-enhancer';
import { createFieldClass } from '../components/field-component';
import toPath from '../utils/to-path';

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

function immutableGetFromState(state, modelString) {
  const path = toPath(modelString);

  return path.reduce((subState, subPath) => {
    // Current subState is immutable
    if ('get' in subState) {
      return subState.get(subPath);
    }

    // Current subState is a plain object/array
    return subState[subPath];
  }, state);
}

const ImmutableField = createFieldClass(undefined, {
  getter: immutableGetFromState,
});

const modelReducer = createModeler(immutableGet, immutableSet);
const modelReducerEnhancer = createModelReducerEnhancer(modelReducer);

function createModelReducer(...args) {
  console.warn('The createModelReducer() function is deprecated (renamed). '
    + 'Please use modelReducer().');

  return modelReducer(...args);
}

export {
  createModelReducer,
  modelReducer,
  modelReducerEnhancer as modeled,
  ImmutableField as Field,
};
