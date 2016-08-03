/* eslint-disable */
import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import { controls, modelReducer, formReducer, Control, actions } from '../src';

export function testCreateStore(reducers) {
  return applyMiddleware(thunk)(createStore)(combineReducers(reducers));
}

export function testRender(component, store) {
  return TestUtils.renderIntoDocument(
    <Provider store={store}>
    { component }
    </Provider>
  );
}
