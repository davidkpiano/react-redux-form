import _get from '../utils/get';
import arraysEqual from '../utils/arrays-equal';
import isPlainObject from '../utils/is-plain-object';
import toPath from '../utils/to-path';
import composeReducers from '../utils/compose-reducers';
import createBatchReducer from '../enhancers/batched-enhancer';

import changeActionReducer from './form/change-action-reducer';
import formActionsReducer from './form-actions-reducer';
import createFieldState, { createFormState } from '../utils/create-field';

export function createInitialState(model, state, customInitialFieldState = {}, options = {}) {
  if (Array.isArray(state) || isPlainObject(state)) {
    return createFormState(model, state, customInitialFieldState, options);
  }

  return createFieldState(model, state, customInitialFieldState, options);
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
