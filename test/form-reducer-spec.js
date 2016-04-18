import sinon from 'sinon';
import { assert } from 'chai';
import { actions, formReducer, initialFieldState, initialFormState, getField } from '../src';

describe('formReducer()', () => {
  it('should create a reducer given a model', () => {
    const reducer = formReducer('test');

    assert.isFunction(reducer);
  });

  it('should work with non-form actions', () => {
    const reducer = formReducer('test');

    assert.doesNotThrow(() => reducer(undefined, { type: 'ANY' }));
  });

  describe('getField() function', () => {
    it('should return an initialFieldState given an uninitialized model', () => {
      const reducer = formReducer('test');

      const actual = reducer(undefined, { type: 'ANY' });

      assert.isFunction(getField);

      assert.deepEqual(getField(actual, 'any'), initialFieldState);

      assert.isObject(getField(actual, 'foo').errors);
    });

    it('should maintain the full fieldState of an updated model', () => {
      const reducer = formReducer('test');

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
    const reducer = formReducer('forms.test');
    const actual = reducer(undefined, actions.focus('forms.test.foo'));
    assert.deepEqual(actual.fields.foo, {
      ...initialFieldState,
      focus: true,
      blur: false,
    });
  });

  it('should initialize fields given an initial state', () => {
    const reducer = formReducer('test', {
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
  describe('Should use stateEnhancer if provided to enhance initial state', () => {
    it('Returns non-enhanced state if not object or function was given', () => {
      let reducer = formReducer('test', {}, 5);
      let actual = reducer(undefined, {});
      assert.deepEqual(actual, { ...initialFormState, model: 'test' });
      reducer = formReducer('test', {}, 'test');
      actual = reducer(undefined, {});
      assert.deepEqual(actual, { ...initialFormState, model: 'test' });
    });
    it('Calls enhancer function with initial state if given', () => {
      const enhancer = sinon.spy(state => state);
      const reducer = formReducer('test', {}, enhancer);
      reducer(undefined, {});
      assert.isTrue(enhancer.calledWith({ ...initialFormState, model: 'test' }));
    });
    it('Merges initial state with enhancer if object was given', () => {
      let reducer = formReducer('test', {}, { myFormField: true });
      let actual = reducer(undefined, {});
      assert.containSubset(actual, { myFormField: true });
      reducer = formReducer('test', { foo: 'bar' }, { fields: { foo: { myFooProp: true } } });
      actual = reducer(undefined, {});
      assert.containSubset(actual.fields, {
        foo: {
          initialValue: 'bar',
          myFooProp: true,
        },
      });
    });
  });
});
