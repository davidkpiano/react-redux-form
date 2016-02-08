import { assert } from 'chai';
import should from 'should';

import { actions, createFormReducer, initialFieldState, getField } from '../lib';

describe('createFormReducer()', () => {
  it('should create a reducer given a model', () => {
    const reducer = createFormReducer('test');

    assert.isFunction(reducer);
  });

  it('should work with non-form actions', () => {
    const reducer = createFormReducer('test');

    assert.doesNotThrow(() => reducer(undefined, { type: 'ANY' }));
  });

  describe('getField() function', () => {
    it('should return an initialFieldState given an uninitialized model', () => {
      const reducer = createFormReducer('test');

      let actual = reducer(undefined, { type: 'ANY' });

      assert.isFunction(getField);

      assert.deepEqual(getField(actual, 'any'), initialFieldState);

      assert.isObject(getField(actual, 'foo').errors);
    });

    it('should maintain the full fieldState of an updated model', () => {
      const reducer = createFormReducer('test');

      let actual = reducer(undefined, actions.focus('test.foo'));

      assert.deepEqual(getField(actual, 'foo'), {
        ...initialFieldState,
        focus: true,
        blur: false
      });

      assert.isObject(getField(actual, 'foo').errors);
    });


    it('should throw an error when given an invalid argument for form state', () => {
      assert.throws(() => getField(true, 'foo'));
      assert.throws(() => getField({}, 'foo'));
      assert.throws(() => getField(undefined, 'foo'));
      assert.throws(() => getField(null, 'foo'));
    });
  });

  it('should be able to handle model at deep state path', () => {
    const reducer = createFormReducer('forms.test');
    let actual = reducer(undefined, actions.focus('forms.test.foo'));
    assert.deepEqual(actual.fields.foo, {
      ...initialFieldState,
      focus: true,
      blur: false
    });
  });
});
