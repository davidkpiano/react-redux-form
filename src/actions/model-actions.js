import _get from '../utils/get';
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
};

function createModelActions(s = defaultStrategies) {
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

  const xor = (
    model,
    item,
    iteratee = (value) => value === item
  ) => (dispatch, getState) => {
    const state = s.get(getState(), model, []);
    const stateWithoutItem = state.filter(stateItem => !iteratee(stateItem));
    const value = (state.length === stateWithoutItem.length) ? [...state, item] : stateWithoutItem;

    dispatch({
      type: actionTypes.CHANGE,
      model,
      value,
    });
  };

  const push = (model, item = null) => (dispatch, getState) => {
    const collection = s.get(getState(), model);
    const value = [...(collection || []), item];

    dispatch({
      type: actionTypes.CHANGE,
      model,
      value,
    });
  };

  const toggle = (model) => (dispatch, getState) => {
    const value = !s.get(getState(), model);

    dispatch({
      type: actionTypes.CHANGE,
      model,
      value,
    });
  };

  const filter = (model, iteratee = identity) => (dispatch, getState) => {
    const collection = s.get(getState(), model);
    const value = collection.filter(iteratee);

    dispatch({
      type: actionTypes.CHANGE,
      model,
      value,
    });
  };

  const reset = (model) => ({
    type: actionTypes.RESET,
    model,
  });

  const map = (model, iteratee = identity) => (dispatch, getState) => {
    const collection = s.get(getState(), model, []);
    const value = collection.map(iteratee);

    dispatch({
      type: actionTypes.CHANGE,
      model,
      value,
    });
  };

  const remove = (model, index) => (dispatch, getState) => {
    const collection = s.get(getState(), model, []);

    dispatch({
      type: actionTypes.CHANGE,
      model,
      value: s.splice(collection, index, 1),
      removeKeys: [index],
    });
  };

  const move = (model, indexFrom, indexTo) => (dispatch, getState) => {
    const collection = s.get(getState(), model, []);

    if (indexFrom >= collection.length || indexTo >= collection.length) {
      throw new Error(`Error moving array item: invalid bounds ${indexFrom}, ${indexTo}`);
    }

    const item = collection[indexFrom];
    const removed = s.splice(collection, indexFrom, 1);
    const inserted = s.splice(removed, indexTo, 0, item);

    dispatch({
      type: actionTypes.CHANGE,
      model,
      value: inserted,
    });
  };

  const merge = (model, values) => (dispatch, getState) => {
    const value = s.get(getState(), model, {});

    dispatch({
      type: actionTypes.CHANGE,
      model,
      value: s.merge(value, values),
    });
  };

  const omit = (model, props = []) => (dispatch, getState) => {
    const value = s.get(getState(), model, {});

    const propsArray = typeof props === 'string'
      ? [props]
      : props;

    const newValue = propsArray.reduce(
      (acc, prop) => s.remove(acc, prop),
      value);

    dispatch({
      type: actionTypes.CHANGE,
      model,
      value: newValue,
      removeKeys: propsArray,
    });
  };

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
