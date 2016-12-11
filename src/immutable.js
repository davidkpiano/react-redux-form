import { createModeler } from './reducers/model-reducer';
import formReducer from './reducers/form-reducer';
import { createModelReducerEnhancer } from './enhancers/modeled-enhancer';
import { createModelActions } from './actions/model-actions';
import { createControlPropsMap } from './constants/control-props-map';
import { createFormCombiner } from './reducers/forms-reducer';
import { createErrorsClass } from './components/errors-component';
import { createControlClass } from './components/control-component';
import { createFormClass } from './components/form-component';
import { createFieldActions } from './actions/field-actions';
import batch from './actions/batch-actions';
import getValue from './utils/get-value';
import immutableGetFromState from './utils/get-from-immutable-state';
import getForm, { getFormStateKey } from './utils/get-form';
import isPlainObject from './utils/is-plain-object';
import Immutable from 'immutable';

import {
  initialFieldState,
  actionTypes,
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

function immutableKeys(state) {
  if (Immutable.Map.isMap(state)) {
    return state.keySeq();
  }
  return Object.keys(state);
}

const baseStrategy = {
  get: immutableGetFromState,
  set: immutableSet,
  getValue,
  keys: immutableKeys,
  splice: (list, ...args) => list.splice(...args),
  merge: (map, ...args) => map.merge(...args),
  remove: (map, ...args) => map.remove(...args),
  push: (list, ...args) => list.push(...args),
  length: (list) => list.size,
  object: new Immutable.Map(),
  array: new Immutable.List(),
  isObject: (state) => (isPlainObject(state) || Immutable.Map.isMap(state)),
};

function immutableGetForm(state, modelString) {
  return getForm(state, modelString, baseStrategy);
}

function immutableGetFormStateKey(state, model) {
  return getFormStateKey(state, model, baseStrategy);
}

function immutableGetFieldFromState(state, modelString) {
  return getField(state, modelString, { getForm: immutableGetForm });
}

const immutableStrategy = {
  ...baseStrategy,
  getForm: immutableGetForm,
  getFieldFromState: immutableGetFieldFromState,
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
  batch,
};

const immutableModelReducer = createModeler(immutableStrategy);
const immutableModelReducerEnhancer = createModelReducerEnhancer(immutableModelReducer);
const immutableControlPropsMap = createControlPropsMap();
const ImmutableControl = createControlClass(immutableControlPropsMap, {
  get: immutableGetFromState,
  getFieldFromState: immutableGetFieldFromState,
  actions: immutableModelActions,
});
const ImmutableField = createFieldClass(immutableControlPropsMap, {
  Control: ImmutableControl,
  getter: immutableGetFromState,
  getFieldFromState: immutableGetFieldFromState,
  changeAction: immutableModelActions.change,
  actions: immutableModelActions,
});
const ImmutableErrors = createErrorsClass(immutableStrategy);
const ImmutableForm = createFormClass({
  ...immutableStrategy,
  actions: immutableActions,
});

const immutableFormCombiner = createFormCombiner({
  modelReducer: immutableModelReducer,
  formReducer: immutableFormReducer,
  modeled: immutableModelReducerEnhancer,
  toJS: (val) => ((val && val.toJS)
    ? val.toJS()
    : val),
});

const immutableCombineForms = immutableFormCombiner.combineForms;
const immutableCreateForms = immutableFormCombiner.createForms;

export {
  // Reducers
  immutableFormReducer as formReducer,
  immutableModelReducer as modelReducer,
  immutableCombineForms as combineForms,
  immutableCreateForms as createForms,

  // Constants
  initialFieldState,
  immutableActions as actions,
  actionTypes,
  immutableControlPropsMap as controls,

  // Components
  ImmutableField as Field,
  ImmutableControl as Control,
  ImmutableForm as Form,
  ImmutableErrors as Errors,

  // Factories
  createFieldClass,

  // Enhancers
  immutableModelReducerEnhancer as modeled,
  batched,

  // Selectors
  form,

  // Utilities
  immutableGetFieldFromState as getField,
  immutableGetForm as getForm,
  immutableGetFormStateKey as getFormStateKey,
  track,
};
