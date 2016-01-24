import { assert } from 'chai';
import should from 'should';

import { actions, createFormReducer, initialFieldState } from '../lib';

describe('createFormReducer()', () => {
  it('should create a reducer given a model', () => {
    const reducer = createFormReducer('test');

    assert.isFunction(reducer);
  });

  it('should work with non-form actions', () => {
    const reducer = createFormReducer('test');

    assert.doesNotThrow(() => reducer(undefined, { type: 'ANY' }));
  });

  describe('field() method', () => {
    it('should return an initialFieldState given an uninitialized model', () => {
      const reducer = createFormReducer('test');

      let actual = reducer(undefined, { type: 'ANY' });

      assert.isFunction(actual.field);

      assert.deepEqual(actual.field('test.any'), initialFieldState);

      assert.isObject(actual.field('foo').errors);
    });

    it('should maintain the full fieldState of an updated model', () => {
      const reducer = createFormReducer('test');

      let actual = reducer(undefined, actions.focus('test.foo'));

      assert.deepEqual(actual.field('foo'), {
        ...initialFieldState,
        focus: true,
        blur: false
      });

      assert.isObject(actual.field('foo').errors);
    });
  });
});
