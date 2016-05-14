/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import { controls, formReducer, modelReducer, Control } from '../src';

function createTestStore(reducers) {
  return applyMiddleware(thunk)(createStore)(combineReducers(reducers));
}

describe('<Control> component', () => {
  it('should exist', () => {
    assert.ok(Control);
  });

  it('should work as expected with a model (happy path)', () => {
    const store = createTestStore({
      test: modelReducer('test', { foo: 'bar' }),
      testForm: formReducer('test', { foo: 'bar' }),
    });

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Control model="test.foo" mapProps={controls.text} component="input" />
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

    assert.ok(input);
  });
});
