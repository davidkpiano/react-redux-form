import i from 'icepick';
import Immutable from 'immutable';
import _get from '../utils/get';
import initialFieldState from '../constants/initial-field-state';
import isPlainObject from './is-plain-object';
import identity from 'lodash.identity';
import _mapValues from '../utils/map-values';

const defaultStrategies = {
  fromJS: identity,
  toJS: identity,
  get: _get,
  set: i.set,
  keys: Object.keys,
  mergeDeep: i.merge,
  initialFieldState,
  mapValues: _mapValues,
};

/* eslint-disable no-use-before-define */
function fieldOrForm(model, value, customInitialFieldState, s = defaultStrategies) {
  if (Array.isArray(value) || isPlainObject(value) || Immutable.Iterable.isIterable(value)) {
    return createFormState(model, value, customInitialFieldState, {}, s);
  }

  return createFieldState(model, value, customInitialFieldState, s);
}
/* eslint-enable no-use-before-define */

function getSubModelString(model, subModel) {
  if (!model) return subModel;

  return `${model}.${subModel}`;
}

export default function createFieldState(
  model,
  value,
  customInitialFieldState,
  s = defaultStrategies
) {
  return s.mergeDeep(s.initialFieldState, s.merge(s.fromJS({
    initialValue: value,
    value,
    model,
  }), customInitialFieldState));
}

export function createFormState(
  model,
  values,
  customInitialFieldState,
  options = {},
  s = defaultStrategies
) {
  const formState = createFieldState(model, values, customInitialFieldState, s);
  let state = s.fromJS({});

  if (options.lazy) return s.set(state, '$form', formState);

  state = s.mapValues(
    values,
    (subValue, subModel) => fieldOrForm(
      getSubModelString(model, subModel), subValue, customInitialFieldState, s
    )
  );

  return s.set(state, '$form', formState);
}
