import { createModeler } from '../reducers/model-reducer';
import { createModelReducerEnhancer } from '../enhancers/modeled-enhancer';
import { createFieldClass } from '../components/field-component';
import { createModelActions } from '../actions/model-actions';
import getValue from '../utils/get-value';
import toPath from '../utils/to-path';
import Immutable from 'immutable';

function immutableGet(state, pathString, defaultValue) {
  const path = toPath(pathString);
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
const immutableModelActions = createModelActions({
  get: immutableGetFromState,
  getValue,
  splice: (list, ...args) => list.splice(...args),
  merge: (map, ...args) => map.merge(...args),
  remove: (map, ...args) => map.remove(...args),
  push: (list, ...args) => list.push(...args),
  length: (list) => list.size,
}, {
  object: new Immutable.Map(),
  array: new Immutable.List(),
});

export {
  modelReducer,
  modelReducerEnhancer as modeled,
  ImmutableField as Field,
  immutableModelActions as actions,
};
