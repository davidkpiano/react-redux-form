import { createModeler } from './reducers/model-reducer';
import formReducer from './reducers/form-reducer';
import { createModelReducerEnhancer } from './enhancers/modeled-enhancer';
import { createModelActions } from './actions/model-actions';
import { createControlPropsMap } from './constants/control-props-map';
import { createFormCombiner } from './reducers/forms-reducer';
import { createControlClass } from './components/control-component';
import { createFormClass } from './components/form-component';
import { createFieldActions } from './actions/field-actions';
import getValue from './utils/get-value';
import getForm from './utils/get-form';
import toPath from './utils/to-path';
import Immutable from 'immutable';

import {
  initialFieldState,
  actionTypes,
  Errors,
  createFieldClass,
  batched,
  form,
  getField,
  track,
} from './index';

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
    if (!subState) return subState;

    // Current subState is immutable
    if ('get' in subState) {
      return subState.get(subPath);
    }

    // Current subState is a plain object/array
    return subState[subPath];
  }, state);
}

function immutableGetForm(state, modelString) {
  return getForm(state, modelString, immutableGetFromState);
}

const immutableStrategy = {
  get: immutableGetFromState,
  set: immutableSet,
  getValue,
  getForm: immutableGetForm,
  splice: (list, ...args) => list.splice(...args),
  merge: (map, ...args) => map.merge(...args),
  remove: (map, ...args) => map.remove(...args),
  push: (list, ...args) => list.push(...args),
  length: (list) => list.size,
  object: new Immutable.Map(),
  array: new Immutable.List(),
};

function transformAction(action) {
  if (action.value && action.value.toJS) {
    return {
      ...action,
      value: action.value.toJS(),
    };
  }

  if (action.actions) {
    return {
      ...action,
      actions: action.actions.map(transformAction),
    };
  }

  return action;
}

function immutableFormReducer(model, initialState = new Immutable.Map(), options = {}) {
  const _initialState = initialState && initialState.toJS
    ? initialState.toJS()
    : initialState;

  return formReducer(model, _initialState, {
    ...options,
    transformAction,
  });
}

const immutableModelActions = createModelActions(immutableStrategy);
const immutableFieldActions = createFieldActions(immutableStrategy);

const immutableActions = {
  ...immutableModelActions,
  ...immutableFieldActions,
};

const immutableModelReducer = createModeler(immutableStrategy);
const immutableModelReducerEnhancer = createModelReducerEnhancer(immutableModelReducer);
const immutableControlPropsMap = createControlPropsMap(immutableStrategy);
const ImmutableField = createFieldClass(immutableControlPropsMap, {
  getter: immutableGetFromState,
  changeAction: immutableModelActions.change,
});
const ImmutableControl = createControlClass(immutableControlPropsMap, {
  getter: immutableGetFromState,
  changeAction: immutableModelActions.change,
});
const ImmutableForm = createFormClass({
  ...immutableStrategy,
  actions: immutableActions,
});

const immutableCombineForms = createFormCombiner({
  modelReducer: immutableModelReducer,
  formReducer: immutableFormReducer,
  modeled: immutableModelReducerEnhancer,
  toJS: (val) => ((val && val.toJS)
    ? val.toJS()
    : val),
});

export {
  // Reducers
  immutableFormReducer as formReducer,
  immutableModelReducer as modelReducer,
  immutableCombineForms as combineForms,

  // Constants
  initialFieldState,
  immutableActions as actions,
  actionTypes,
  immutableControlPropsMap as controls,

  // Components
  ImmutableField as Field,
  ImmutableControl as Control,
  ImmutableForm as Form,
  Errors,

  // Factories
  createFieldClass,

  // Enhancers
  immutableModelReducerEnhancer as modeled,
  batched,

  // Selectors
  form,

  // Utilities
  getField,
  track,
};
