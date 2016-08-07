import { assert } from 'chai';
import getForm from '../src/utils/get-form';
import { modelReducer, combineForms, actions } from '../src';

describe('combineForms()', () => {
  context('standard combined reducer', () => {
    const reducer = combineForms({
      foo: modelReducer('foo', { one: 'two' }),
      bar: modelReducer('bar', { three: 'four' }),
    });

    it('exists as a function', () => {
      assert.isFunction(combineForms);
    });

    it('should return a reducer function', () => {
      assert.isFunction(reducer);
    });

    describe('initial state', () => {
      const initialState = reducer(undefined, { type: null });

      it('should contain the initial state of each reducer', () => {
        assert.containSubset(initialState, {
          foo: { one: 'two' },
          bar: { three: 'four' },
        });
      });
    });

    describe('usage with getForm()', () => {
      const state = reducer(undefined, { type: null });

      it('should be able to retrieve the proper form', () => {
        const fooForm = getForm(state, 'foo');

        assert.equal(fooForm, state.forms.foo);

        const barForm = getForm(state, 'bar');

        assert.equal(barForm, state.forms.bar);
      });
    });
  });

  describe('implicit model reducer creation with initial state', () => {
    const implicitReducer = combineForms({
      foo: { one: 'two' },
      bar: { three: 'four' },
    });

    it('should respond to change actions', () => {
      let state = implicitReducer(undefined, actions.change('foo.one', 'changed'));

      assert.equal(state.foo.one, 'changed');

      state = implicitReducer(state, actions.change('bar.three', 'changed again'));

      assert.equal(state.bar.three, 'changed again');
    });
  });

  describe('setting the "key" option', () => {
    const customKeyReducer = combineForms({
      foo: { bar: 'baz' },
    }, { key: 'myForms' });

    const initialState = customKeyReducer(undefined, { type: null });

    it('should have the form reducer state under the custom forms key', () => {
      assert.equal(initialState.myForms.$form.model, '');
    });

    it('should be retrievable with getForm()', () => {
      const fooForm = getForm(initialState, 'foo');

      assert.equal(fooForm, initialState.myForms.foo);
    });
  });
});
