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
    let dispatch;

    const form = TestUtils.renderIntoDocument(
      <LocalForm
        getDispatch={d => dispatch = d}
        onUpdate={(formValue) => innerFormState = formValue}
      >
        <Control.text model=".foo" />
      </LocalForm>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

    it('should update with the loaded form value', () => {
      dispatch(actions.setPristine('local'));
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
    let dispatch;

    const form = TestUtils.renderIntoDocument(
      <LocalForm getDispatch={d => dispatch = d}>
        <Control.text model=".foo" />
      </LocalForm>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

    it('should initially have an empty object (by default) as the model value', () => {
      assert.equal(input.value, ''); // { foo: '' }
    });

    it('should behave like a normal form, with an internal Redux state', () => {
      dispatch(actions.change('local', { foo: 'changed' }));

      assert.equal(input.value, 'changed');
    });
  });

  describe('onChange with initialState', () => {
    let dispatch;

    const form = TestUtils.renderIntoDocument(
      <LocalForm
        getDispatch={d => dispatch = d}
        initialState={{ foo: 'bar' }}
      >
        <Control.text model=".foo" />
      </LocalForm>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

    it('should initially have an empty object (by default) as the model value', () => {
      assert.equal(input.value, 'bar');
    });

    it('should behave like a normal form, with an internal Redux state', () => {
      dispatch(actions.change('local', { foo: 'changed' }));

      assert.equal(input.value, 'changed');
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
