import { assert } from 'chai';
import { actions, formReducer, initialFieldState, getField } from '../src';

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

  describe('deep paths', () => {
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

    it('should become valid when an invalid field is removed', (done) => {
      const reducer = formReducer('test', {
        items: [],
      });

      const validItem = reducer(undefined, actions.setValidity('test.items[0]', true));
      const invalidItem = reducer(validItem, actions.setValidity('test.items[1]', false));

      assert.isFalse(invalidItem.valid, 'form should be invalid');

      let removedState;

      const dispatch = (action) => {
        removedState = reducer(invalidItem, action);
        assert.isTrue(removedState.valid);
        done();
      };

      const getState = () => invalidItem;

      actions.remove('test.items', 1)(dispatch, getState);
    });

    it('should become valid when a field with an invalid property is removed', (done) => {
      const reducer = formReducer('test', {
        items: [
          { name: 'item1' },
          { name: 'item2' },
        ],
      });

      const validItem = reducer(undefined, actions.setValidity('test.items[0].name', true));
      const invalidItem = reducer(validItem, actions.setValidity('test.items[1].name', false));

      assert.isFalse(invalidItem.valid, 'form should be invalid');

      let removedState;

      const dispatch = (action) => {
        removedState = reducer(invalidItem, action);
        assert.isTrue(removedState.valid);
        done();
      };

      const getState = () => invalidItem;

      actions.remove('test.items', 1)(dispatch, getState);
    });

    it('should clean after itself when a field is removed', (done) => {
      const reducer = formReducer('test', {
        items: [
          { name: 'item1' },
          { name: 'item2' },
        ],
      });

      const validItem = reducer(
        undefined,
        actions.setValidity('test.items[0].name', true));
      const invalidItem = reducer(
        validItem,
        actions.setValidity('test.items[1].name', false));

      assert.isFalse(invalidItem.valid, 'form should be invalid');

      let removedState;

      const dispatch = action => {
        removedState = reducer(invalidItem, action);
        assert.isFalse(removedState.valid);
        assert.isUndefined(removedState.fields['items.1.name']);
      };

      const getState = () => invalidItem;

      actions.remove('test.items', 0)(dispatch, getState);

      const dispatch2 = action => {
        const removedState2 = reducer(removedState, action);
        assert.isTrue(removedState2.valid);
        done();
      };

      const getState2 = () => removedState;

      actions.remove('test.items', 0)(dispatch2, getState2);
    });

    it('should have correct overall validity after a field validity is reset', () => {
      const reducer = formReducer('test', {
        foo: 'one',
        bar: 'two',
      });

      const bothInvalidState = reducer(undefined, actions.setFieldsValidity('test', {
        foo: false,
        bar: false,
      }));

      assert.isFalse(bothInvalidState.valid);

      const oneInvalidState = reducer(bothInvalidState, actions.setValidity('test.foo', true));

      assert.isFalse(oneInvalidState.valid);

      const validState = reducer(oneInvalidState, actions.setValidity('test.bar', true));

      assert.isTrue(validState.valid);
    });

    it('should clean after itself when a valid field (scenario with 3 items)', (done) => {
      const reducer = formReducer('test', {
        items: [
          { name: 'item1' },
          { name: 'item2' },
          { name: 'item3' },
        ],
      });

      const state1 = reducer(
        undefined,
        actions.setValidity('test.items[0].name', true));
      const state2 = reducer(
        state1,
        actions.setValidity('test.items[1].name', false));
      const state3 = reducer(
        state2,
        actions.setValidity('test.items[2].name', true));

      assert.isFalse(state3.valid, 'form should be invalid');

      let removedState;

      const dispatch = action => {
        removedState = reducer(state3, action);
        assert.isFalse(removedState.valid, 'form should still be invalid');
        done();
      };

      const getState = () => state3;

      actions.remove('test.items', 2)(dispatch, getState);
    });

    it('should clean all props after itself when a field is removed', (done) => {
      const reducer = formReducer('test', {
        items: [
          { name: 'item1', dummy: true },
          { name: 'item2', dummy: true },
        ],
      });

      const invalidItem = reducer(
        undefined,
        actions.setValidity('test.items[1].name', false)
      );

      let removedState;

      const dispatch = action => {
        removedState = reducer(invalidItem, action);
        assert.isUndefined(removedState.fields['items.1.name']);
        assert.isUndefined(removedState.fields['items.1.dummy']); // <-- this field is leftover
        done();
      };

      const getState = () => invalidItem;

      actions.remove('test.items', 0)(dispatch, getState);
    });
  });

  describe('SET_SUBMIT_FAILED action', () => {
    it('should set all fields to submitFailed = true when form submitFailed = true', () => {
      const reducer = formReducer('test', { foo: '', bar: '' });

      const actual = reducer(undefined, actions.setSubmitFailed('test'));

      assert.containSubset(actual, {
        submitFailed: true,
        submitted: false,
        fields: {
          foo: {
            submitFailed: true,
            touched: true,
            submitted: false,
          },
          bar: {
            submitFailed: true,
            touched: true,
            submitted: false,
          },
        },
      });
    });

    it('should set all fields to submitFailed = false when form submitFailed = false', () => {
      const reducer = formReducer('test', { foo: '', bar: '' });

      const submitFailed = reducer(undefined, actions.setSubmitFailed('test', false));

      const actual = reducer(submitFailed, actions.setSubmitted('test'));

      assert.containSubset(actual, {
        submitFailed: false,
        submitted: true,
        fields: {
          foo: {
            submitFailed: false,
            touched: true,
            submitted: true,
          },
          bar: {
            submitFailed: false,
            touched: true,
            submitted: true,
          },
        },
      });
    });
  });
});
