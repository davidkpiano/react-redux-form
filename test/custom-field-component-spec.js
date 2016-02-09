import React from 'react';
import chai from 'chai';
import chaiSubset from 'chai-subset';
import should from 'should';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import thunk from 'redux-thunk';
import TestUtils from 'react-addons-test-utils';

chai.use(chaiSubset);

const { assert } = chai;

import { Input } from 'react-bootstrap';

import { Field, createFieldClass, actions, createFormReducer, createModelReducer, initialFieldState } from '../lib';

describe('Custom <Field /> components', () => {
  const BSField = createFieldClass({ 'Input': 'input' });

  const store = applyMiddleware(thunk)(createStore)(combineReducers({
    testForm: createFormReducer('test'),
    test: createModelReducer('test', {
      input: 'bar',
      radio: 'one',
      checkbox: ['check one']
    })
  }));

  it('should recognize mapped controls', () => {
    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <BSField model="test.input">
          <Input type="text" />
        </BSField>
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    TestUtils.Simulate.change(input, {
      target: { value: 'testing' }
    });

    assert.equal(
      store.getState().test.input,
      'testing')
  });
});
