import _get from '../utils/get';
import i from 'icepick';
import arraysEqual from '../utils/arrays-equal';
import isPlainObject from 'lodash/isPlainObject';
import isArray from 'lodash/isArray';
import mapValues from '../utils/map-values';
import toPath from '../utils/to-path';
import composeReducers from '../utils/compose-reducers';
import createBatchReducer from '../enhancers/batched-enhancer';
import initialFieldState from '../constants/initial-field-state';

import changeActionReducer from './form/change-action-reducer';
import formActionsReducer from './form-actions-reducer';

function getSubModelString(model, subModel) {
  if (!model) return subModel;

  return `${model}.${subModel}`;
}

export function createInitialState(model, state, customInitialFieldState = {}, options = {}) {
  let initialState;
  const {
    lazy = false,
  } = options;

  if (isArray(state) || isPlainObject(state)) {
    initialState = lazy
      ? {}
      : mapValues(state, (subState, subModel) =>
        createInitialState(getSubModelString(model, subModel), subState, customInitialFieldState));
  } else {
    return i.merge(initialFieldState, {
      initialValue: state,
      value: state,
      model,
      ...customInitialFieldState,
    });
  }

  const initialForm = i.merge(initialFieldState, {
    initialValue: state,
    value: state,
    model,
    ...customInitialFieldState,
  });

  return i.set(initialState, '$form', initialForm);
}

function wrapFormReducer(plugin, modelPath, initialState) {
  return (state = initialState, action) => {
    if (!action.model) return state;

    const path = toPath(action.model);

    if (modelPath.length && !arraysEqual(path.slice(0, modelPath.length), modelPath)) {
      return state;
    }

    const localPath = path.slice(modelPath.length);

    return plugin(state, action, localPath);
  };
}

const defaultPlugins = [
  formActionsReducer,
  changeActionReducer,
];

export default function createFormReducer(
  model,
  initialState = {},
  options = {},
) {
  const {
    plugins = [],
    initialFieldState: customInitialFieldState,
    transformAction = null,
  } = options;
  const modelPath = toPath(model);
  const initialFormState = createInitialState(model, initialState,
    customInitialFieldState, options);

  const wrappedPlugins = plugins
    .concat(defaultPlugins)
    .map((plugin) => wrapFormReducer(plugin, modelPath, initialFormState));

  return createBatchReducer(composeReducers(...wrappedPlugins), undefined, {
    transformAction,
  });
}
