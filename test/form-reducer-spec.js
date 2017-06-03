import { assert } from 'chai';
import {
  actions,
  formReducer,
} from '../src';
import isValid from '../src/form/is-valid';

describe('formReducer()', () => {
  it('should create a reducer given a model', () => {
    const reducer = formReducer('test');

    assert.isFunction(reducer);
  });

  it('should work with non-form actions', () => {
    const reducer = formReducer('test');

    assert.doesNotThrow(() => reducer(undefined, { type: 'ANY' }));
  });

  describe('deep paths', () => {
    it('should be able to handle model at deep state path', () => {
      const reducer = formReducer('forms.test');
      const actual = reducer(undefined, actions.focus('forms.test.foo'));
      assert.containSubset(actual.foo, {
        focus: true,
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

      assert.containSubset(actual, {
        foo: {
          initialValue: 'bar',
        },
        deep: {
          one: { initialValue: 'one' },
          two: {
            three: { initialValue: 'four' },
          },
        },
      });
    });

    it('should become valid when an invalid field is removed', (done) => {
      const reducer = formReducer('test', {
        items: [1, 2],
      });

      const validItem = reducer(undefined, actions.setValidity('test.items[0]', true));
      const invalidItem = reducer(validItem, actions.setValidity('test.items[1]', false));

      assert.isFalse(isValid(invalidItem), 'form should be invalid');

      let removedState;

      const dispatch = (action) => {
        removedState = reducer(invalidItem, action);

        assert.isTrue(isValid(removedState.$form));

        done();
      };

      const getState = () => ({ test: { items: [1, 2] } });

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

      assert.isFalse(isValid(invalidItem), 'form should be invalid');

      let removedState;

      const dispatch = (action) => {
        removedState = reducer(invalidItem, action);
        assert.isTrue(isValid(removedState));
        done();
      };

      const getState = () => invalidItem;

      actions.remove('test.items', 1)(dispatch, getState);
    });

    it('should clean after itself when a field is removed', (done) => {
      const items = [
        { name: 'item1' },
        { name: 'item2' },
      ];
      const reducer = formReducer('test', {
        items,
      });

      const validItem = reducer(
        undefined,
        actions.setValidity('test.items[0].name', true));
      const invalidItem = reducer(
        validItem,
        actions.setValidity('test.items[1].name', false));

      assert.isFalse(isValid(invalidItem), 'form should be invalid');

      let removedState;

      const dispatch = (action) => {
        removedState = reducer(invalidItem, action);

        assert.isFalse(isValid(removedState));
        assert.isUndefined(removedState.items[1]);
      };

      const getState = () => ({ test: { items } });

      actions.remove('test.items', 0)(dispatch, getState);

      const dispatch2 = (action) => {
        const removedState2 = reducer(removedState, action);
        assert.isTrue(isValid(removedState2));
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

      assert.isFalse(isValid(bothInvalidState));

      const oneInvalidState = reducer(bothInvalidState, actions.setValidity('test.foo', true));

      assert.isFalse(isValid(oneInvalidState));

      const validState = reducer(oneInvalidState, actions.setValidity('test.bar', true));

      assert.isTrue(isValid(validState));
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

      assert.isFalse(isValid(state3), 'form should be invalid');

      let removedState;

      const dispatch = action => {
        removedState = reducer(state3, action);
        assert.isFalse(isValid(removedState), 'form should still be invalid');
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
        assert.isUndefined(removedState.items[1]);
        done();
      };

      const getState = () => invalidItem;

      actions.remove('test.items', 0)(dispatch, getState);
    });
  });

  describe('SET_SUBMIT_FAILED action', () => {
    it('should set form to submitFailed = true when submitFailed = false', () => {
      const reducer = formReducer('test', { foo: '', bar: '' });

      const actual = reducer(undefined, actions.setSubmitFailed('test'));

      assert.containSubset(actual, {
        $form: {
          submitFailed: true,
          submitted: false,
        },
      });
    });

    it('should set form to submitFailed = false when form submitFailed = false', () => {
      const reducer = formReducer('test', { foo: '', bar: '' });

      const actual = reducer(undefined, actions.setSubmitFailed('test', false));

      assert.containSubset(actual, {
        $form: {
          submitFailed: false,
          submitted: false,
        },
      });
    });
  });

  describe('lazy form initialization', () => {
    const initialState = { foo: '', bar: 'initial', baz: '' };
    const reducer = formReducer('test', initialState, {
      lazy: true,
    });

    it('should not initially create subfields', () => {
      assert.notProperty(reducer(undefined, { type: 'ANY' }), 'foo');
      assert.notProperty(reducer(undefined, { type: 'ANY' }), 'bar');
      assert.notProperty(reducer(undefined, { type: 'ANY' }), 'baz');
    });

    it('should still have the initial state', () => {
      assert.deepEqual(reducer(undefined, { type: 'ANY' }).$form.initialValue,
        initialState);
    });

    it('should create the fields only when interacted with', () => {
      const action = actions.setTouched('test.foo');
      const touchedState = reducer(undefined, action);

      assert.property(touchedState, 'foo');
      assert.isTrue(touchedState.foo.touched);
      assert.notProperty(touchedState, 'bar');
      assert.notProperty(touchedState, 'baz');
    });

    it('should lazily set the initial value when the field is created', () => {
      const action = actions.setTouched('test.bar');
      const touchedState = reducer(undefined, action);

      assert.equal(touchedState.bar.initialValue, 'initial');
    });
  });

  describe('form reset after dynamically adding fields', () => {
    const initialState = { filters: {} };
    const reducer = formReducer('test', initialState);
    const firstState = reducer(undefined, { type: 'any' });
    const addedState = reducer(firstState, actions.change('test.filters.one', true));

    it('form initial value should not change when adding fields', () => {
      assert.deepEqual(addedState.filters.$form.initialValue, {});
      assert.deepEqual(addedState.filters.$form.value, { one: true });
      assert.isDefined(addedState.filters.one);
    });

    it('form should reset completely to its initial value', () => {
      const resetState = reducer(addedState, actions.reset('test.filters'));

      assert.deepEqual(resetState.filters.$form.initialValue, {});
      assert.deepEqual(resetState.filters.$form.value, {});
      assert.isUndefined(resetState.filters.one);
    });
  });
});
