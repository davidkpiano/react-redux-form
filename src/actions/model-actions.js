import _get from '../utils/get';
import endsWith from 'lodash/endsWith';
import identity from 'lodash/identity';
import icepick from 'icepick';

import actionTypes from '../action-types';
import { trackable } from '../utils/track';

function isEvent(event) {
  return !!(event && event.stopPropagation && event.preventDefault);
}

function getValue(event) {
  return isEvent(event) ? event.target.value : event;
}

function isMulti(model) {
  return endsWith(model, '[]');
}

const change = trackable((model, value, options = {}) => {
  // option defaults
  const changeOptions = {
    silent: false,
    multi: isMulti(model),
    ...options,
  };

  return {
    type: actionTypes.CHANGE,
    model,
    value: getValue(value),
    ...changeOptions,
  };
});

const xor = trackable((
  model,
  item,
  iteratee = (value) => value === item
) => (dispatch, getState) => {
  const state = _get(getState(), model, []);
  const stateWithoutItem = state.filter(stateItem => !iteratee(stateItem));
  const value = (state.length === stateWithoutItem.length) ? [...state, item] : stateWithoutItem;

  dispatch({
    type: actionTypes.CHANGE,
    model,
    value,
  });
});

const push = trackable((model, item = null) => (dispatch, getState) => {
  const collection = _get(getState(), model);
  const value = [...(collection || []), item];

  dispatch({
    type: actionTypes.CHANGE,
    model,
    value,
  });
});

const toggle = trackable((model) => (dispatch, getState) => {
  const value = !_get(getState(), model);

  dispatch({
    type: actionTypes.CHANGE,
    model,
    value,
  });
});

const filter = trackable((model, iteratee = identity) => (dispatch, getState) => {
  const collection = _get(getState(), model);
  const value = collection.filter(iteratee);

  dispatch({
    type: actionTypes.CHANGE,
    model,
    value,
  });
});

const reset = trackable((model) => ({
  type: actionTypes.RESET,
  model,
}));

const map = trackable((model, iteratee = identity) => (dispatch, getState) => {
  const collection = _get(getState(), model, []);
  const value = collection.map(iteratee);

  dispatch({
    type: actionTypes.CHANGE,
    model,
    value,
  });
});

const remove = trackable((model, index) => (dispatch, getState) => {
  const collection = _get(getState(), model, []);

  dispatch({
    type: actionTypes.CHANGE,
    model,
    value: icepick.splice(collection, index, 1),
    removeKeys: [index],
  });
});

const move = trackable((model, indexFrom, indexTo) => (dispatch, getState) => {
  const collection = _get(getState(), model, []);

  if (indexFrom >= collection.length || indexTo >= collection.length) {
    throw new Error(`Error moving array item: invalid bounds ${indexFrom}, ${indexTo}`);
  }

  const item = collection[indexFrom];
  const removed = icepick.splice(collection, indexFrom, 1);
  const inserted = icepick.splice(removed, indexTo, 0, item);

  dispatch({
    type: actionTypes.CHANGE,
    model,
    value: inserted,
  });
});

const merge = trackable((model, values) => (dispatch, getState) => {
  const value = _get(getState(), model, {});

  dispatch({
    type: actionTypes.CHANGE,
    model,
    value: icepick.merge(value, values),
  });
});

const omit = trackable((model, props = []) => (dispatch, getState) => {
  const value = _get(getState(), model, {});

  const propsArray = typeof props === 'string'
    ? [props]
    : props;

  const newValue = propsArray.reduce(
    (acc, prop) => icepick.dissoc(acc, prop),
    value);

  dispatch({
    type: actionTypes.CHANGE,
    model,
    value: newValue,
    removeKeys: propsArray,
  });
});

const load = trackable((model, values) => change(model, values, {
  silent: true,
}));

export default {
  change,
  filter,
  map,
  merge,
  push,
  remove,
  move,
  reset,
  toggle,
  xor,
  load,
  omit,
};
