import React from 'react';
import { assert } from 'chai';
import Immutable from 'immutable';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import TestUtils from 'react-dom/test-utils';

import { actions, formReducer } from '../src';
import {
  modelReducer as immutableModelReducer,
  Field as ImmutableField,
} from '../immutable';

describe('<Field> with Immutable.js', () => {
  const reducer = immutableModelReducer('test',
    Immutable.fromJS({ foo: 'bar' }));

  const store = createStore(combineReducers({
    test: reducer,
    testForm: formReducer('test', { foo: 'bar' }),
  }));

  const field = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <ImmutableField model="test.foo">
        <input />
      </ImmutableField>
    </Provider>
  );

  const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

  it('control should have the immutable model value', () => {
    assert.equal(input.value, 'bar');
  });

  it('should be able to change the value', () => {
    input.value = 'new';

    TestUtils.Simulate.change(input);

    assert.equal(store.getState().test.get('foo'), 'new');
    assert.equal(input.value, 'new');
  });

  it('should be able to externally change the value', () => {
    store.dispatch(actions.change('test.foo', 'external'));

    assert.equal(store.getState().test.get('foo'), 'external');
    assert.equal(input.value, 'external');
  });
});
