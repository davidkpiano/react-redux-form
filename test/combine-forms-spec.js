import { assert } from 'chai';
import getForm from '../src/utils/get-form';
import { modelReducer, combineForms } from '../src';

describe('combineForms()', () => {
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
