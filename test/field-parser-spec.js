import React from 'react';
import chai from 'chai';
import chaiSubset from 'chai-subset';
import should from 'should';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import TestUtils from 'react-addons-test-utils';

chai.use(chaiSubset);

const { assert } = chai;

import {
  Field,
  createModelReducer
} from '../lib';

describe('<Field parser={...} />', () => {
  it('should parse the changed values given a parser function', () => {
    const store = createStore(combineReducers({
      test: createModelReducer('test')
    }));

    const parseValue = (val) => ({
      data: val
    });

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field
          model="test.foo"
          parser={parseValue}>
          <input type="text" />
        </Field>
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    let expected = { data: 'foo' };

    input.value = 'foo';

    TestUtils.Simulate.change(input);

    assert.deepEqual(
      store.getState().test.foo,
      expected);
  });
});
