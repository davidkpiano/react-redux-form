import { assert } from 'chai';
import { actions, createFormReducer, initialFieldState, getField } from '../src';

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

      const actual = reducer(undefined, { type: 'ANY' });

      assert.isFunction(getField);

      assert.deepEqual(getField(actual, 'any'), initialFieldState);

      assert.isObject(getField(actual, 'foo').errors);
    });

    it('should maintain the full fieldState of an updated model', () => {
      const reducer = createFormReducer('test');

      const actual = reducer(undefined, actions.focus('test.foo'));


      assert.deepEqual(getField(actual, 'foo'), {
        ...initialFieldState,
        focus: true,
        blur: false,
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
    const actual = reducer(undefined, actions.focus('forms.test.foo'));
    assert.deepEqual(actual.fields.foo, {
      ...initialFieldState,
      focus: true,
      blur: false,
    });
  });

  it('should initialize fields given an initial state', () => {
    const reducer = createFormReducer('test', {
      foo: 'bar',
      deep: {
        one: 'one',
        two: {
          three: 'four',
        },
      },
    });

    const actual = reducer(undefined, {});

    assert.containSubset(actual.fields, {
      foo: {
        initialValue: 'bar',
      },
      'deep.one': {
        initialValue: 'one',
      },
      'deep.two.three': {
        initialValue: 'four',
      },
    });
  });
});
