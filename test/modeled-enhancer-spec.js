import chai from 'chai';

const { assert } = chai;

import { modeled, actions, actionTypes } from '../src';

describe('modeled() reducer enhancer', () => {
  const initialState = {
    foo: 'one',
    bar: 'two'
  };

  const fullAction = {
    type: 'FULL'
  };

  const existingReducer = (state = initialState, action) => {
    console.log(state);
    if (action.type === fullAction.type) {
      return {
        ...state,
        full: state.foo + state.bar
      }
    }

    if (action.type === actionTypes.RESET) {
      return {
        ...state,
        reset: true
      }
    }

    return state;
  };

  it('should exist', () => {
    assert.isFunction(modeled);
  });

  it('should return a function', () => {
    assert.isFunction(modeled(existingReducer, 'test'));
  });

  it('should maintain the initial state of the existing reducer', () => {
    const modeledReducer = modeled(existingReducer, 'test');

    assert.deepEqual(
      modeledReducer(undefined, { type: null }),
      initialState);
  });

  it('should respect the existing behavior of the existing reducer', () => {
    const modeledReducer = modeled(existingReducer, 'test');

    assert.deepEqual(
      modeledReducer(undefined, fullAction),
      {
        foo: 'one',
        bar: 'two',
        full: 'onetwo'
      });
  });

  it('should act as a model reducer to update the state', () => {
    const modeledReducer = modeled(existingReducer, 'test');

    assert.deepEqual(
      modeledReducer(undefined, actions.change('test.foo', 'test')),
      {
        foo: 'test',
        bar: 'two'
      });
  });

  it('should allow common action to operate on both reducers', () => {
    const modeledReducer = modeled(existingReducer, 'test');

    const changedState = {
      foo: 'changed',
      bar: 'changed'
    }

    assert.deepEqual(
      modeledReducer(changedState, actions.reset('test.foo')),
      {
        foo: 'one',
        bar: 'changed',
        reset: true
      });
  });
});
