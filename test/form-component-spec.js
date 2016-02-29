/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import { Form, createModelReducer, createFormReducer, Field } from '../src';

describe('<Form> component', () => {
  const store = applyMiddleware(thunk)(createStore)(combineReducers({
    testForm: createFormReducer('test'),
    test: createModelReducer('test'),
  }));

  const form = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <Form model="test"
        validators={{
          foo: (val) => val === 'testing',
        }}
      >

        <Field model="test.foo">
          <input type="text" />
        </Field>
      </Form>
    </Provider>
  );

  const formElement = TestUtils.findRenderedDOMComponentWithTag(form, 'form');

  const control = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

  it('should validate all validators on submit', () => {
    TestUtils.Simulate.submit(formElement);

    assert.containSubset(
      store.getState().testForm.fields.foo,
      { valid: false });

    control.value = 'testing';

    TestUtils.Simulate.change(control);

    TestUtils.Simulate.submit(formElement);

    assert.containSubset(
      store.getState().testForm.fields.foo,
      { valid: true });
  });
});
