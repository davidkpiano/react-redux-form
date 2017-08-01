import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';

import { modelReducer, Field, formReducer } from '../src';

describe('<Field parser={...} />', () => {
  context('standard usage', () => {
    const store = createStore(combineReducers({
      test: modelReducer('test', { foo: '' }),
      testForm: formReducer('test', { foo: '' }),
    }));

    const parseValue = val => ({
      data: val,
    });

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field
          model="test.foo"
          parser={parseValue}
          validators={{
            isParsed: (val) => val
              && val.data
              && val.data === 'parse test',
          }}
        >
          <input type="text" />
        </Field>
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    it('should parse the changed values given a parser function', () => {
      const expected = { data: 'foo' };

      input.value = 'foo';

      TestUtils.Simulate.change(input);

      assert.deepEqual(
        store.getState().test.foo,
        expected);
    });

    it('should parse before validation', () => {
      input.value = 'parse test';

      assert.isFalse(
        store.getState().testForm.foo.$form.validity.isParsed,
        'should not be valid yet');

      TestUtils.Simulate.change(input);

      assert.isTrue(
        store.getState().testForm.foo.$form.validity.isParsed);
    });
  });

  it('should parse the initial value immediately', () => {
    const store = createStore(combineReducers({
      test: modelReducer('test', { foo: 'initial' }),
      testForm: formReducer('test', { foo: 'initial' }),
    }));

    const parseValue = val => val.toUpperCase();

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field
          model="test.foo"
          parser={parseValue}
        >
          <input type="text" />
        </Field>
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    assert.equal(input.value, 'INITIAL');

    assert.equal(store.getState().test.foo, 'INITIAL');
  });

  it('should update the viewValue with only the data returned by parser', () => {
    const initial = { foo: '0123456789' };
    const expected = '0123';

    const store = createStore(combineReducers({
      test: modelReducer('test', initial),
      testForm: formReducer('test', initial),
    }));

    const parseValue = val => val.substring(0, 4);

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field
          model="test.foo"
          parser={parseValue}
        >
          <input type="text" />
        </Field>
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');
    input.value = '012345678912341268374612837';
    TestUtils.Simulate.change(input);

    assert.equal(input.value, expected);

    assert.equal(store.getState().test.foo, expected);
  });
});
