import React from 'react';
import { assert } from 'chai';
import Immutable from 'immutable';
import { createStore, applyMiddleware } from 'redux';
import { combineReducers } from 'redux-immutablejs';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import TestUtils from 'react-addons-test-utils';

import { actions } from '../src';
import {
  Control as ImmutableControl,
  createForms as immutableCreateForms,
} from '../immutable';

describe('<Field> with Immutable.js', () => {
  const store = createStore(combineReducers({
    ...immutableCreateForms({
      test: Immutable.fromJS({ foo: 'bar' }),
    }),
  }), applyMiddleware(thunk));

  const field = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <ImmutableControl.text model="test.foo" />
    </Provider>
  );

  const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

  it('control should have the immutable model value', () => {
    assert.equal(input.value, 'bar');
  });

  it('should be able to change the value', () => {
    input.value = 'new';

    TestUtils.Simulate.change(input);

    assert.equal(store.getState().get('test').get('foo'), 'new');
    assert.equal(input.value, 'new');
  });

  it('should be able to externally change the value', () => {
    store.dispatch(actions.change('test.foo', 'external'));

    assert.equal(store.getState().get('test').get('foo'), 'external');
    assert.equal(input.value, 'external');
  });
});
