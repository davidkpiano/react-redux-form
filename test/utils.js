/* eslint-disable */
import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import _get from 'lodash.get';
import toPath from 'lodash.topath';
import i from 'icepick';
import Immutable from 'immutable';

import { controls, modelReducer, formReducer, Control, actions } from '../src';

export const defaultTestContexts = {
  standard: {
    object: {},
    get: (value, path) => {
      if (!path) return value;
      return _get(value, path);
    },
    set: (state, path, value) => i.setIn(state, path, value),
    length: (value) => value.length,
    getInitialState: (state) => state,
  },
  immutable: {
    object: new Immutable.Map(),
    get: (value, path) => {
      if (!path) return value.toJS();

      const result = value.getIn(toPath(path));
      try {
        return result.toJS();
      } catch (e) {
        return result;
      }
    },
    set: (state, path, value) => state.setIn(path, value),
    length: (value) => value.size,
    getInitialState: (state) => Immutable.fromJS(state),
  },
};

export function testCreateStore(reducers, thunk = false) {
  if (thunk) {
    return applyMiddleware(thunk)(createStore)(combineReducers(reducers));
  }

  return createStore(combineReducers(reducers));
}

export function testRender(component, store) {
  return TestUtils.renderIntoDocument(
    <Provider store={store}>
    { component }
    </Provider>
  );
}
