import _get from '../utils/get';
import Immutable from 'immutable';
import i from 'icepick';
import arraysEqual from '../utils/arrays-equal';
import isPlainObject from 'lodash/isPlainObject';
import identity from 'lodash/identity';
import _mapValues from '../utils/map-values';
import toPath from '../utils/to-path';
import composeReducers from '../utils/compose-reducers';
import createBatchReducer from '../enhancers/batched-enhancer';
import _initialFieldState from '../constants/initial-field-state';
import isValid, { fieldsValid } from '../form/is-valid';
import isPristine from '../form/is-pristine';
import _changeActionReducer from './form/change-action-reducer';
import _formActionsReducer from './form-actions-reducer';

const defaultStrategies = {
  defaultPlugins: [
    _changeActionReducer,
    _formActionsReducer,
  ],
  get: _get,
  set: i.set,
  isObject: isPlainObject,
  isValid,
  isPristine,
  fieldsValid,
  keys: Object.keys,
  setIn: i.setIn,
  initialFieldState: _initialFieldState,
  fromJS: identity,
  toJS: identity,
  merge: i.assign,
  mergeDeep: i.merge,
  mapValues: _mapValues,
};

function getSubModelString(model, subModel) {
  if (!model) return subModel;

  return `${model}.${subModel}`;
}

export function createInitialState(model,
  state,
  customInitialFieldState = {},
  options = {},
  s = defaultStrategies) {
  let initialState;

  const {
    lazy = false,
  } = options;

  if (Array.isArray(state) || isPlainObject(state) || Immutable.Iterable.isIterable(state)) {
    initialState = lazy
      ? s.fromJS({})
      : s.mapValues(
          state,
          (subState, subModel) => createInitialState(
            getSubModelString(model, subModel), subState, customInitialFieldState, undefined, s
          )
        );
  } else {
    return s.mergeDeep(s.initialFieldState, s.merge(s.fromJS({
      initialValue: state,
      value: state,
      model,
    }), customInitialFieldState));
  }

  const initialForm = s.mergeDeep(s.initialFieldState, s.merge(s.fromJS({
    initialValue: state,
    value: state,
    model,
  }), customInitialFieldState));

  return s.set(initialState, '$form', initialForm);
}

function wrapFormReducer(plugin, modelPath, initialState, strategies) {
  return (state = initialState, action) => {
    if (!action.model) return state;

    const path = toPath(action.model);

    if (modelPath.length && !arraysEqual(path.slice(0, modelPath.length), modelPath)) {
      return state;
    }

    const localPath = path.slice(modelPath.length);

    return plugin(state, action, localPath, strategies);
  };
}

export default function createFormReducer(
  model,
  initialState = {},
  options = {},
  s = defaultStrategies
) {
  const {
    plugins = [],
    initialFieldState: customInitialFieldState,
    transformAction = null,
  } = options;
  const modelPath = toPath(model);
  const initialFormState = createInitialState(model, initialState,
    customInitialFieldState, options, s);

  const wrappedPlugins = plugins
    .concat(s.defaultPlugins)
    .map((plugin) => wrapFormReducer(plugin, modelPath, initialFormState, s));

  return createBatchReducer(composeReducers(...wrappedPlugins), undefined, {
    transformAction,
  });
}
