import _get from '../utils/get';
import GET from 'lodash/get';
import identity from 'lodash/identity';
import icepick from 'icepick';

import getValue from '../utils/get-value';
import isMulti from '../utils/is-multi';
import actionTypes from '../action-types';
import mapValues from '../utils/map-values';
import { trackable } from '../utils/track';

const defaultStrategies = {
  get: _get,
  getValue,
  splice: icepick.splice,
  merge: icepick.merge,
  remove: icepick.dissoc,
  push: icepick.push,
  length: (value) => value.length,
};

const defaultValues = {
  object: {},
  array: [],
};

function optionsFromArgs(args, index, options = {}) {
  if (typeof index === 'undefined') return undefined;

  return { ...options, ...args[index] };
}

export function createModelActions(s = defaultStrategies, d = defaultValues) {
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
    return (model, ...args) => (dispatch, getState) => {
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
  }, d.array, 3);

  const push = createModifierAction((value, item) => s.push(value || d.array, item), d.array, 2);

  const toggle = createModifierAction((value) => !value, undefined, 1);

  const filter = createModifierAction((value, iteratee) => value.filter(iteratee), d.array, 2);

  const reset = (model) => ({
    type: actionTypes.RESET,
    model,
  });

  const map = createModifierAction((value, iteratee = identity) => value.map(iteratee), d.array, 2);

  const remove = createModifierAction((value, index) => s.splice(value, index, 1), d.array, 2,
    (_, index) => ({ removeKeys: [index] }));

  const move = createModifierAction((value, indexFrom, indexTo) => {
    if (indexFrom >= s.length(value) || indexTo >= s.length(value)) {
      throw new Error(`Error moving array item: invalid bounds ${indexFrom}, ${indexTo}`);
    }

    const item = s.get(value, indexFrom);
    const removed = s.splice(value, indexFrom, 1);
    const inserted = s.splice(removed, indexTo, 0, item);

    return inserted;
  }, d.array, 3);

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
  });

  return mapValues({
    change,
    xor,
    push,
    toggle,
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
