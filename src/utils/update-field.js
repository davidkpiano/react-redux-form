import i from 'icepick';
import _get from './get';
import _mapValues from './map-values';
import identity from 'lodash/identity';
import _initialFieldState from '../constants/initial-field-state';
import { createInitialState } from '../reducers/form-reducer';

const defaultStrategies = {
  get: _get,
  set: i.set,
  setIn: i.setIn,
  initialFieldState: _initialFieldState,
  fromJS: identity,
  merge: i.assign,
  mergeDeep: i.merge,
  mapValues: _mapValues,
};

function assocIn(state, path, value, fn, s = defaultStrategies) {
  if (!path.length) return s.set(state, value);
  if (!fn) return s.setIn(state, path, value);

  const key0 = path[0];

  if (path.length === 1) {
    return fn(s.set(state, key0, value));
  }

  stateFirstKeyVal = s.get(state, key0, s.fromJS({}));

  return fn(s.set(state, key0, assocIn(stateFirstKeyVal, path.slice(1), value, fn, s)));
}

function tempInitialState(path, initialValue = null, s = defaultStrategies) {
  if (path.length === 1) return s.fromJS({ [path[0]]: initialValue });

  return s.fromJS({
    [path[0]]: tempInitialState(path.slice(1), initialValue),
  });
}

export function getFieldAndForm(formState, modelPath, s = defaultStrategies) {
  let field = s.get(formState, modelPath);
  let form = formState;

  if (!field) {
    const initialValue = s.get(formState, ['$form', 'initialValue'].concat(modelPath));
    const modelValue = s.get(formState, ['$form', 'model']);
    const temporaryFieldState = tempInitialState(modelPath, initialValue, s);
    const initialState = createInitialState(modelValue, temporaryFieldState, {}, {}, s)

    form = s.mergeDeep(
      initialState, 
      formState
    );

    field = s.get(form, modelPath);
  }

  return [field, form];
}

export default function updateField(state, path, newState, newSubState, updater, s = defaultStrategies) {
  const [field, fullState] = getFieldAndForm(state, path, s);

  if (!field) return state;

  const $form = s.get(field, ['$form']);
  const isForm = $form !== undefined;
  const fieldPath = isForm
    ? path.concat(['$form'])
    : path;

  const fieldState = isForm
    ? $form
    : field;

  const updatedFieldState = typeof newState === 'function'
    ? newState(fieldState)
    : newState;

  if (isForm && newSubState) {
    const formState = s.mapValues(field, (subState, key) => {
      if (key === '$form') {
        return s.merge(
          fieldState,
          updatedFieldState);
      }

      const updatedSubState = typeof newSubState === 'function'
        ? newSubState(subState, updatedFieldState)
        : newSubState;

      return s.merge(subState, updatedSubState);
    });

    if (!path.length) return formState;

    return assocIn(fullState, path, formState, updater, s);
  }

  return assocIn(fullState, fieldPath, s.merge(
    fieldState,
    updatedFieldState), updater, s);
}
