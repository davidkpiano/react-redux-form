/* eslint no-return-assign:0 */
import React from 'react';
import { Control, LocalForm, actions } from '../src';
import TestUtils from 'react-dom/test-utils';
import { assert } from 'chai';

describe('local forms', () => {
  it('should exist', () => {
    assert.isFunction(LocalForm);
  });

  describe('standard usage with onUpdate', () => {
    let innerFormState;

    const form = TestUtils.renderIntoDocument(
      <LocalForm onUpdate={(formValue) => innerFormState = formValue}>
        <Control.text model=".foo" />
      </LocalForm>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

    it('should initially update with the loaded form value', () => {
      assert.containSubset(innerFormState, {
        $form: {
          pristine: true,
        },
      });
    });

    it('should behave like a normal form, with an internal Redux state', () => {
      input.value = 'changed';
      TestUtils.Simulate.change(input);

      assert.containSubset(innerFormState, {
        $form: {
          pristine: false,
        },
        foo: {
          pristine: false,
          value: 'changed',
        },
      });
    });
  });

  describe('standard usage with onChange', () => {
    let innerModelState;

    const form = TestUtils.renderIntoDocument(
      <LocalForm onChange={(modelValue) => innerModelState = modelValue}>
        <Control.text model=".foo" />
      </LocalForm>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

    it('should initially have an empty object (by default) as the model value', () => {
      assert.deepEqual(innerModelState, {});
    });

    it('should behave like a normal form, with an internal Redux state', () => {
      input.value = 'changed';
      TestUtils.Simulate.change(input);

      assert.deepEqual(innerModelState, {
        foo: 'changed',
      });
    });
  });

  describe('onChange with initialState', () => {
    let innerModelState;

    const form = TestUtils.renderIntoDocument(
      <LocalForm
        onChange={(modelValue) => innerModelState = modelValue}
        initialState={{ foo: 'bar' }}
      >
        <Control.text model=".foo" />
      </LocalForm>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

    it('should initially have an empty object (by default) as the model value', () => {
      assert.deepEqual(innerModelState, { foo: 'bar' });
    });

    it('should behave like a normal form, with an internal Redux state', () => {
      input.value = 'changed';
      TestUtils.Simulate.change(input);

      assert.deepEqual(innerModelState, {
        foo: 'changed',
      });
    });
  });

  describe('getDispatch', () => {
    let innerModelState;
    let dispatcher;

    TestUtils.renderIntoDocument(
      <LocalForm
        onChange={(modelValue) => innerModelState = modelValue}
        getDispatch={dispatch => dispatcher = dispatch}
        initialState={{
          foo: '',
          bar: '',
        }}
      >
        <Control.text model=".foo" />
      </LocalForm>
    );

    it('should provide a dispatch function', () => {
      assert.isFunction(dispatcher);
    });

    it('should allow normal dispatch behavior', () => {
      dispatcher(actions.change('local.foo', 'changed foo'));

      assert.equal(innerModelState.foo, 'changed foo');
    });

    it('should allow thunk-like behaviour', () => {
      dispatcher(actions.merge('local', {
        foo: 'FOO',
        bar: 'BAR',
      }));

      assert.deepEqual(innerModelState, {
        foo: 'FOO',
        bar: 'BAR',
      });
    });
  });
});
