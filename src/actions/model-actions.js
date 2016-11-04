import _get from '../utils/get';
import identity from 'lodash/identity';
import i from 'icepick';

import getValue from '../utils/get-value';
import isMulti from '../utils/is-multi';
import actionTypes from '../action-types';
import mapValues from '../utils/map-values';
import { trackable } from '../utils/track';

const defaultStrategies = {
  get: _get,
  getValue,
  splice: i.splice,
  merge: i.merge,
  remove: i.dissoc,
  push: i.push,
  length: (value) => value.length,
  object: {},
  array: [],
};

function optionsFromArgs(args, index, options = {}) {
  if (typeof index === 'undefined') return undefined;

  return { ...options, ...args[index] };
}

export function createModelActions(s = defaultStrategies) {
  const change = (model, value, options = {}) => {
    // option defaults
    const changeOptions = {
      silent: false,
      multi: isMulti(model),
      ...options,
    };

    return {
      type: actionTypes.CHANGE,
      model,
      value: s.getValue(value),
      ...changeOptions,
    };
  };

  function createModifierAction(modifier, defaultValue, optionsIndex, getOptions) {
    const actionCreator = (model, ...args) => (dispatch, getState) => {
      const modelValue = s.get(getState(), model, defaultValue);
      const value = modifier(modelValue, ...args);

      const options = getOptions
        ? getOptions(value, ...args)
        : undefined;

      dispatch(change(
        model,
        value,
        optionsFromArgs(args, optionsIndex - 1, options)));
    };

    actionCreator.withValue = (model, ...args) =>
      (value) => {
        const options = getOptions
          ? getOptions(value, ...args)
          : undefined;

        change(
          model,
          modifier(value, ...args),
          optionsFromArgs(args, optionsIndex - 1, options));
      };

    return actionCreator;
  }

  const xor = createModifierAction((value, item, iteratee = (_item) => _item === item) => {
    const valueWithoutItem = value.filter((_item) => !iteratee(_item));

    return (s.length(value) === s.length(valueWithoutItem))
      ? [...value, item]
      : valueWithoutItem;
  }, s.array, 3);

  const push = createModifierAction((value, item) => s.push(value || s.array, item), s.array, 2);

  const toggle = createModifierAction((value) => !value, undefined, 1);

  const checkWithValue = (model, value, modelValue) => {
    if (isMulti(model)) {
      const valueWithItem = modelValue || s.array;
      const valueWithoutItem = (valueWithItem || s.array)
        .filter(item => item !== value);
      const multiValue = (s.length(valueWithoutItem) === s.length(valueWithItem))
        ? s.push(valueWithItem, value)
        : valueWithoutItem;

      return change(model, multiValue);
    }

    return change(model, !modelValue);
  };

  const check = (model, value) => (dispatch, getState) => {
    const modelValue = s.get(getState(), model);

    const action = checkWithValue(model, value, modelValue);

    dispatch(action);
  };

  const filter = createModifierAction((value, iteratee) => value.filter(iteratee), s.array, 2);

  const reset = (model) => ({
    type: actionTypes.RESET,
    model,
  });

  const map = createModifierAction((value, iteratee = identity) => value.map(iteratee), s.array, 2);

  const remove = createModifierAction((value, index) => s.splice(value, index, 1), s.array, 2,
    (_, index) => ({ removeKeys: [index] }));

  const move = createModifierAction((value, indexFrom, indexTo) => {
    if (indexFrom >= s.length(value) || indexTo >= s.length(value)) {
      throw new Error(`Error moving array item: invalid bounds ${indexFrom}, ${indexTo}`);
    }

    const item = s.get(value, indexFrom);
    const removed = s.splice(value, indexFrom, 1);
    const inserted = s.splice(removed, indexTo, 0, item);

    return inserted;
  }, s.array, 3);

  const merge = createModifierAction(s.merge, {}, 2);

  const omit = createModifierAction((value, props = []) => {
    const propsArray = typeof props === 'string'
      ? [props]
      : props;

    const newValue = propsArray.reduce(
      (acc, prop) => s.remove(acc, prop),
      value);

    return newValue;
  }, {}, 2, (_, props) => ({ removeKeys: props }));

  const load = (model, values) => change(model, values, {
    silent: true,
    load: true,
  });

  return mapValues({
    change,
    xor,
    push,
    toggle,
    check,
    checkWithValue,
    filter,
    reset,
    map,
    remove,
    move,
    merge,
    omit,
    load,
  }, trackable);
}

export default createModelActions();
