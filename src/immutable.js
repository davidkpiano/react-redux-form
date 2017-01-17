import setWith from 'lodash/setWith';
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
import Fieldset from './components/fieldset-component';
import batch from './actions/batch-actions';
import getValue from './utils/get-value';
import { create as createIteratee } from './utils/iteratee';
import { immutableMapValues } from './utils/map-values';
import immutableGetFromState from './utils/get-from-immutable-state';
import getForm, { getFormStateKey } from './utils/get-form';
import isPlainObject from './utils/is-plain-object';
import Immutable from 'immutable';
import { createGetField } from './utils/get-field';
import { create as createIsValid } from './form/is-valid';
import { create as createIsPristine } from './form/is-pristine';
import { create as createIsRetouched } from './form/is-retouched';

import { createChangeActionReducer } from './reducers/form/change-action-reducer';
import { createFormActionReducer } from './reducers/form-actions-reducer';

import {
  initialFieldState,
  actionTypes,
  createFieldClass,
  batched,
  form,
  getField,
  track,
} from './index';

const immutableInitialFieldState = Immutable.fromJS(initialFieldState);

function immutableSetIn(state, path, value) {
  try {
    const isNumericPath = path.filter((val) => !isNaN(val)).length > 0;

    if (isNumericPath) {
      // Due to issue https://github.com/facebook/immutable-js/issues/1008
      // If a numerical key is present, convert to regular JS, do a merge, and return.
      // This is slow, so remove once the issue is fixed.
      const updatedState = setWith(state.toJS(), path, value, Object);
      return Immutable.fromJS(updatedState);
    }

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

const merge = (map, ...args) => (map ? map.merge(...args) : map);

const baseStrategy = {
  get: immutableGetFromState,
  set: (state, ...args) => state.set(...args),
  setIn: immutableSetIn,
  getValue,
  keys: immutableKeys,
  splice: (list, ...args) => list.splice(...args),
  merge,
  mergeDeep: merge,
  remove: (map, ...args) => map.remove(...args),
  push: (list, ...args) => list.push(...args),
  length: (list) => list.size,
  object: new Immutable.Map(),
  array: new Immutable.List(),
  isObject: (state) => (isPlainObject(state) || Immutable.Map.isMap(state)),
  fromJS: Immutable.fromJS,
  toJS: (obj) => (obj ? obj.toJS() : {}),
  mapValues: immutableMapValues,
  map: (obj, fn) => obj.map(fn).toSet(),
};

function immutableGetForm(state, modelString) {
  return getForm(state, modelString, baseStrategy);
}

function immutableGetFormStateKey(state, model) {
  return getFormStateKey(state, model, baseStrategy);
}

function immutableGetFieldFromState(state, modelString) {
  return getField(state, modelString, { getForm: immutableGetForm, ...baseStrategy });
}

const isValid = createIsValid(baseStrategy).isValid;
const fieldsValid = createIsValid(baseStrategy).fieldsValid;
const isPristine = createIsPristine(baseStrategy);
const isRetouched = createIsRetouched(baseStrategy);
const getFieldStrategy = createGetField(baseStrategy);
const iterateeValue = createIteratee(baseStrategy).iterateeValue;

const immutableStrategy = {
  ...baseStrategy,
  getForm: immutableGetForm,
  getFieldFromState: immutableGetFieldFromState,
  initialFieldState: immutableInitialFieldState,
  getField: getFieldStrategy,
  isValid,
  fieldsValid,
  isPristine,
  isRetouched,
  iterateeValue,
};

// function transformAction(action) {
//   if (action.value && action.value.toJS) {
//     return {
//       ...action,
//       value: action.value.toJS(),
//     };
//   }

//   if (action.actions) {
//     return {
//       ...action,
//       actions: action.actions.map(transformAction),
//     };
//   }

//   return action;
// }

function immutableFormReducer(model, initialState = new Immutable.Map(), options = {}) {
  return formReducer(model, initialState, {
    ...options,
    // transformAction,
  }, {
    defaultPlugins: [
      createChangeActionReducer(immutableStrategy),
      createFormActionReducer(immutableStrategy),
    ],
    ...immutableStrategy,
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
const immutableControlPropsMap = createControlPropsMap(immutableStrategy);
const ImmutableControl = createControlClass(immutableControlPropsMap, {
  ...immutableStrategy,
  actions: immutableModelActions,
});
const ImmutableField = createFieldClass(immutableControlPropsMap, {
  Control: ImmutableControl,
  getter: immutableGetFromState,
  getFieldFromState: immutableGetFieldFromState,
  changeAction: immutableModelActions.change,
  actions: immutableModelActions,
  fromJS: immutableStrategy.fromJS,
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
  ...immutableStrategy,
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
  immutableInitialFieldState as initialFieldState,
  immutableActions as actions,
  actionTypes,
  immutableControlPropsMap as controls,

  // Components
  ImmutableField as Field,
  ImmutableControl as Control,
  ImmutableForm as Form,
  ImmutableErrors as Errors,
  Fieldset, // not immutable-specific

  // Factories
  createFieldClass,

  // Enhancers
  immutableModelReducerEnhancer as modeled,
  batched,

  // Selectors
  form,
  isValid,
  isPristine,
  isRetouched,

  // Utilities
  immutableGetFieldFromState as getField,
  immutableGetForm as getForm,
  immutableGetFormStateKey as getFormStateKey,
  track,

  immutableStrategy as strategy,
};
