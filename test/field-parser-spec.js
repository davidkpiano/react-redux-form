import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';

import { modelReducer, formReducer, Field } from '../src';

describe('<Field parser={...} />', () => {
  describe('standard usage of parser', () => {
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
        store.getState().testForm.fields.foo.validity.isParsed,
        'should not be valid yet');

      TestUtils.Simulate.change(input);

      assert.isTrue(
        store.getState().testForm.fields.foo.validity.isParsed);
    });
  });

  describe('with formatter', () => {
    const store = createStore(combineReducers({
      test: modelReducer('test', { foo: 'a' }),
      testForm: formReducer('test', { foo: '' }),
    }));

    const parseValue = val => ({
      data: val,
    });

    const formatValue = val => val.data;

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field
          model="test.foo"
          parser={parseValue}
          formatter={formatValue}
        >
          <input type="text" />
        </Field>
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    input.value = 'format test';

    TestUtils.Simulate.change(input);

    it('should properly parse the value with the parser', () => {
      assert.deepEqual(store.getState().test.foo, { data: 'format test' });
    });

    it('should format the view value with the formatter', () => {
      assert.equal(input.value, 'format test');
    });
  });
});
