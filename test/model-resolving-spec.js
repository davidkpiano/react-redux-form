import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
// import { applyMiddleware, combineReducers, createStore } from 'redux';
// import { Provider } from 'react-redux';
// import thunk from 'redux-thunk';
// import sinon from 'sinon';
// import capitalize from 'lodash/capitalize';

import {
  // controls,
  modelReducer,
  formReducer,
  Form,
  Control,
  track,
  // actions,
} from '../src';
import { testCreateStore, testRender } from './utils';

describe('model resolving', () => {
  const initialState = {
    foo: 'foo model',
    bar: ['first', 'second', 'third'],
    baz: [
      { id: 1, value: 'one' },
      { id: 2, value: 'two' },
      { id: 3, value: 'three' },
      { id: 4, value: [
        { id: 10, value: 'deep one' },
        { id: 20, value: 'deep two' },
      ] },
    ],
  };

  const store = testCreateStore({
    test: modelReducer('test', initialState),
    testForm: formReducer('test', initialState),
  });

  const unresolvedModels = [
    {
      label: 'with a dot accessor',
      parent: 'test',
      model: '.foo',
      expected: 'foo model',
    },
    {
      label: 'with a bracket accessor',
      parent: 'test',
      model: '["foo"]',
      expected: 'foo model',
    },
    {
      label: 'from an array',
      parent: 'test.bar',
      model: '[1]',
      expected: 'second',
    },
    {
      label: 'with a parent tracker',
      parent: track('test.baz[]', { id: 1 }),
      model: '.value',
      expected: 'one',
    },
  ];

  unresolvedModels.forEach(({
    label,
    parent,
    model,
    expected,
  }) => {
    const app = testRender(
      <Form model={parent}>
        <Control.text model={model} />
      </Form>, store);

    const input = TestUtils.findRenderedDOMComponentWithTag(app, 'input');

    it(`should resolve a partial model ${label}`, () => {
      assert.equal(input.value, expected);
    });
  });
});
