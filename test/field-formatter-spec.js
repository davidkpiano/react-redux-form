import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';

import { modelReducer, Field, formReducer } from '../src';

describe('<Field formatter={...} />', () => {
  it('should format the initial value immediately', () => {
    const store = createStore(combineReducers({
      test: modelReducer('test', { foo: 'initial' }),
      testForm: formReducer('test', { foo: 'initial' }),
    }));

    const formatValue = val => val.toUpperCase();

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field
          model="test.foo"
          formatter={formatValue}
        >
          <input type="text" />
        </Field>
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    assert.equal(input.value, 'INITIAL');

    assert.equal(store.getState().test.foo, 'initial');
  });

  it('should update the viewValue with only the data returned by formatter', () => {
    const initial = { foo: '0123456789' };
    const expected = '0123';
    const inputValue = '012345678912341268374612837';

    const store = createStore(combineReducers({
      test: modelReducer('test', initial),
      testForm: formReducer('test', initial),
    }));

    const formatValue = val => val.substring(0, 4);

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field
          model="test.foo"
          formatter={formatValue}
        >
          <input type="text" />
        </Field>
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');
    input.value = inputValue;
    TestUtils.Simulate.change(input);

    assert.equal(input.value, expected);

    assert.equal(store.getState().test.foo, inputValue);
  });
});
