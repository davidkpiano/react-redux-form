import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';

import { modelReducer, Field } from '../src';

describe('<Field parser={...} />', () => {
  it('should parse the changed values given a parser function', () => {
    const store = createStore(combineReducers({
      test: modelReducer('test'),
    }));

    const parseValue = val => ({
      data: val,
    });

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

    const expected = { data: 'foo' };

    input.value = 'foo';

    TestUtils.Simulate.change(input);

    assert.deepEqual(
      store.getState().test.foo,
      expected);
  });
});
