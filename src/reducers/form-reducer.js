import _get from '../utils/get';
import icepick from 'icepick';
import arraysEqual from '../utils/arrays-equal';
import isPlainObject from 'lodash/isPlainObject';
import isArray from 'lodash/isArray';
import mapValues from '../utils/map-values';
import toPath from '../utils/to-path';
import composeReducers from '../utils/compose-reducers';
import createBatchReducer from '../enhancers/batched-enhancer';

import changeActionReducer from './form/change-action-reducer';
import setValidityActionReducer from './form/set-validity-action-reducer';
import resetValidityActionReducer from './form/reset-validity-action-reducer';
import focusActionReducer from './form/focus-action-reducer';
import setPristineActionReducer from './form/set-pristine-action-reducer';
import setDirtyActionReducer from './form/set-dirty-action-reducer';
import blurTouchActionReducer from './form/blur-touch-action-reducer';
import untouchActionReducer from './form/untouch-action-reducer';
import pendingActionReducer from './form/pending-action-reducer';
import submittedActionReducer from './form/submitted-action-reducer';
import submitFailedActionReducer from './form/submit-failed-action-reducer';
import resetActionReducer from './form/reset-action-reducer';

export const initialFieldState = {
  focus: false,
  pending: false,
  pristine: true,
  submitted: false,
  submitFailed: false,
  retouched: false,
  touched: false,
  valid: true,
  validating: false,
  validated: false,
  validity: {},
  errors: {},
};

export function getField(state, path) {
  if (process.env.NODE_ENV !== 'production') {
    if (!isPlainObject(state)) {
      throw new Error(`Could not retrieve field '${path}' `
        + 'from an invalid/empty form state.');
    }
  }

  if (!path.length && state.$form) {
    return state.$form;
  }

  return _get(state, path, initialFieldState);
}

function getSubModelString(model, subModel) {
  if (!model) return subModel;

  return `${model}.${subModel}`;
}

export function createInitialState(model, state, customInitialFieldState = {}) {
  let initialState;

  if (isArray(state) || isPlainObject(state)) {
    initialState = mapValues(state, (subState, subModel) =>
      createInitialState(getSubModelString(model, subModel), subState, customInitialFieldState));
  } else {
    return icepick.merge(initialFieldState, {
      initialValue: state,
      value: state,
      model,
      ...customInitialFieldState,
    });
  }

  const initialForm = icepick.merge(initialFieldState, {
    initialValue: state,
    value: state,
    model,
    ...customInitialFieldState,
  });

  return icepick.set(initialState, '$form', initialForm);
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
  focusActionReducer,
  blurTouchActionReducer,
  untouchActionReducer,
  setPristineActionReducer,
  setDirtyActionReducer,
  changeActionReducer,
  setValidityActionReducer,
  resetValidityActionReducer,
  pendingActionReducer,
  submittedActionReducer,
  submitFailedActionReducer,
  resetActionReducer,
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
  const initialFormState = createInitialState(model, initialState, customInitialFieldState);

  const wrappedPlugins = plugins
    .concat(defaultPlugins)
    .map((plugin) => wrapFormReducer(plugin, modelPath, initialFormState));

  return createBatchReducer(composeReducers(...wrappedPlugins), undefined, {
    transformAction,
  });
}
