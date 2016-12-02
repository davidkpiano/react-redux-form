import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';

import {
  // controls,
  modelReducer,
  formReducer,
  Form,
  Control,
  Field,
  Errors,
  Fieldset,
  track,
  actions,
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
    {
      label: 'with a child tracker',
      parent: 'test',
      model: track('.baz[].value', { id: 2 }),
      expected: 'two',
    },
    {
      label: 'with a parent and child tracker',
      parent: track('test.baz[]', { id: 4 }),
      model: track('.value[].value', { id: 20 }),
      expected: 'deep two',
    },
  ];

  unresolvedModels.forEach(({
    label,
    parent,
    model,
    expected,
  }) => {
    ['input', 'text', 'textarea'].forEach((controlType) => {
      [Form, Fieldset].forEach((Container) => {
        const TestControl = Control[controlType];

        const app = testRender(
          <Container model={parent}>
            <TestControl model={model} />
          </Container>, store);

        const input = TestUtils.findRenderedDOMComponentWithTag(app,
          controlType === 'textarea' ? 'textarea' : 'input');

        it(`(${controlType}) should resolve a partial model ${label}`, () => {
          assert.equal(input.value, expected);
        });
      });
    });

    describe('with <Field>', () => {
      const app = testRender(
        <Form model={parent}>
          <Field model={model}>
            <input />
          </Field>
        </Form>, store);

      const input = TestUtils.findRenderedDOMComponentWithTag(app, 'input');

      it(`should resolve a partial model ${label}`, () => {
        assert.equal(input.value, expected);
      });
    });
  });

  describe('with reset control', () => {
    const resetStore = testCreateStore({
      test: modelReducer('test', { foo: '' }),
      testForm: formReducer('test', { foo: '' }),
    });

    const app = testRender(
      <Form model="test">
        <Control.reset model="." />
      </Form>, resetStore);

    const button = TestUtils.findRenderedDOMComponentWithTag(app, 'button');

    it('should resolve to the parent model and reset the form', () => {
      resetStore.dispatch(actions.change('test.foo', 'changed'));

      assert.equal(resetStore.getState().test.foo, 'changed');

      TestUtils.Simulate.click(button);

      assert.equal(resetStore.getState().test.foo, '');
    });
  });

  describe('with <Errors />', () => {
    const errorStore = testCreateStore({
      test: modelReducer('test', { foo: '' }),
      testForm: formReducer('test', { foo: '' }),
    });

    const app = testRender(
      <Form
        model="test"
        errors={{ foo: () => 'this is incorrect' }}
      >
        <Errors model=".foo" />
      </Form>, errorStore);

    const errors = TestUtils.scryRenderedDOMComponentsWithTag(app, 'span');

    it('should show the proper errors for the resolved model', () => {
      assert.lengthOf(errors, 1);
      assert.equal(errors[0].innerHTML, 'this is incorrect');
    });
  });
});
