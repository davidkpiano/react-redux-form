/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import { controls, modelReducer, formReducer, Control } from '../src';

function createTestStore(reducers) {
  return applyMiddleware(thunk)(createStore)(combineReducers(reducers));
}

describe('<Control> component', () => {
  describe('existence check', () => {
    it('should exist', () => {
      assert.ok(Control);
    });
  });

  describe('basic functionality', () => {
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

    it('should work as expected with a model (happy path)', () => {
      assert.ok(input);
      assert.equal(input.value, 'bar');
    });

    it('should handle changes properly', () => {
      input.value = 'new';

      TestUtils.Simulate.change(input);

      assert.equal(store.getState().test.foo, 'new');
    });
  });

  describe('onLoad prop', () => {
    const store = createTestStore({
      test: modelReducer('test', { fff: 'bar' }),
      testForm: formReducer('test', { fff: 'bar' }),
    });

    const handleLoad = sinon.spy();

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Control
          model="test.fff"
          mapProps={controls.text}
          component="input"
          onLoad={handleLoad}
        />
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

    it('should call the onLoad function', () => {
      assert.ok(handleLoad.calledOnce);

      assert.equal(handleLoad.args[0][0], 'bar');
      assert.containSubset(handleLoad.args[0][1], {
        initialValue: 'bar',
      });
      assert.instanceOf(handleLoad.args[0][2], window.HTMLInputElement);
      assert.equal(handleLoad.args[0][2], input);
    });
  });
});
