import chai from 'chai';
import Immutable from 'immutable';

const { assert } = chai;

import { actions, actionTypes } from '../src';
import { modeled } from '../src/immutable';

describe('immutable modeled() reducer enhancer', () => {
  const initialState = Immutable.fromJS({
    foo: 'one',
    bar: 'two'
  });

  const fullAction = {
    type: 'FULL'
  };

  const existingReducer = (state = initialState, action) => {
    if (action.type === fullAction.type) {
      return state.set('full', state.get('foo') + state.get('bar'));
    }

    if (action.type === actionTypes.RESET) {
      return state.set('reset', true);
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

    assert.ok(
      modeledReducer(undefined, { type: null })
        .equals(initialState));
  });

  it('should respect the existing behavior of the existing reducer', () => {
    const modeledReducer = modeled(existingReducer, 'test');

    assert.ok(
      modeledReducer(undefined, fullAction)
        .equals(Immutable.fromJS({
          foo: 'one',
          bar: 'two',
          full: 'onetwo'
        }))
    );
  });

  it('should act as a model reducer to update the state', () => {
    const modeledReducer = modeled(existingReducer, 'test');

    assert.ok(
      modeledReducer(undefined, actions.change('test.foo', 'test'))
        .equals(Immutable.fromJS({
          foo: 'test',
          bar: 'two'
        }))
    );
  });

  it('should allow common action to operate on both reducers', () => {
    const modeledReducer = modeled(existingReducer, 'test');

    const changedState = Immutable.fromJS({
      foo: 'changed',
      bar: 'changed'
    });

    assert.ok(
      modeledReducer(changedState, actions.reset('test.foo'))
        .equals(Immutable.fromJS({
          foo: 'one',
          bar: 'changed',
          reset: true
        }))
    );
  });
});
