import { assert } from 'chai';
import {
  actions,
  actionTypes,
  initialFieldState,
  form as selectForm,
  formReducer,
} from '../src';
import mapValues from '../src/utils/map-values';
import toPath from 'lodash.topath';
import get from '../src/utils/get';

describe('formReducer() (V1)', () => {
  it('should exist as a function', () => {
    assert.isFunction(formReducer);
  });

  const formActionsSpec = {
    [actionTypes.CHANGE]: [
      {
        action: actions.change,
        args: ['foo'],
        expectedField: {
          pristine: false,
          validated: false,
          value: 'foo',
        },
        expectedForm: {
          pristine: false,
        },
      },
      {
        action: actions.change,
        args: [{ foo: 'bar' }],
        expectedField: {
          $form: {
            pristine: false,
            validated: false,
            value: { foo: 'bar' },
          },
        },
        expectedForm: {
          pristine: false,
        },
      },
      {
        action: actions.change,
        args: [[1, 2, 3]],
        expectedField: {
          $form: {
            pristine: false,
            validated: false,
            value: [1, 2, 3],
          },
        },
        expectedForm: {
          pristine: false,
        },
      },
      {
        action: actions.load,
        args: ['string'],
        expectedField: {
          pristine: true,
          value: 'string',
          loadedValue: 'string',
        },
        expectedForm: {
          pristine: true,
        },
      },
      {
        action: actions.load,
        args: [42],
        expectedField: {
          pristine: true,
          value: 42,
          loadedValue: 42,
        },
        expectedForm: {
          pristine: true,
        },
      },
      {
        action: actions.load,
        args: [{ foo: 'bar' }],
        expectedField: {
          $form: {
            pristine: true,
            value: { foo: 'bar' },
            loadedValue: { foo: 'bar' },
          },
          foo: {
            pristine: true,
            value: 'bar',
            initialValue: 'bar',
          },
        },
        expectedForm: {
          pristine: true,
        },
      },
    ],
    [actionTypes.FOCUS]: [
      {
        action: actions.focus,
        args: [],
        expectedField: { focus: true },
      },
    ],
    [actionTypes.SET_PRISTINE]: [
      {
        action: actions.setPristine,
        args: [],
        expectedField: { pristine: true },
      },
      {
        action: actions.setPristine,
        initialState: {
          $form: {
            ...initialFieldState,
            pristine: false,
          },
          name: {
            ...initialFieldState,
            pristine: false,
          },
        },
        args: [],
        expectedField: { pristine: true },
        expectedForm: { pristine: true },
      },
      {
        action: actions.setPristine,
        initialState: {
          $form: {
            ...initialFieldState,
            pristine: false,
          },
          name: {
            ...initialFieldState,
            pristine: false,
          },
          other: {
            ...initialFieldState,
            pristine: true,
          },
        },
        args: [],
        expectedField: { pristine: true },
        expectedForm: { pristine: true },
      },
      {
        action: actions.setPristine,
        initialState: {
          $form: {
            ...initialFieldState,
            pristine: false,
          },
          name: {
            ...initialFieldState,
            pristine: false,
          },
          other: {
            ...initialFieldState,
            pristine: false,
          },
        },
        args: [],
        expectedField: { pristine: true },
        expectedForm: { pristine: false },
      },
    ],
    [actionTypes.SET_DIRTY]: [
      {
        action: actions.setDirty,
        args: [],
        expectedField: { pristine: false },
      },
    ],
    [actionTypes.BLUR]: [
      {
        action: actions.blur,
        args: [],
        expectedField: {
          focus: false,
          touched: true,
        },
        expectedForm: {
          touched: true,
        },
      },
      {
        label: 'after submitted',
        action: actions.blur,
        initialState: {
          $form: {
            ...initialFieldState,
            submitted: true,
            retouched: false,
          },
          name: {
            ...initialFieldState,
            retouched: false,
          },
        },
        expectedField: {
          focus: false,
          touched: true,
          retouched: true,
        },
        expectedForm: {
          touched: true,
          retouched: true,
        },
      },
    ],
    [actionTypes.SET_UNTOUCHED]: [
      {
        action: actions.setUntouched,
        args: [],
        expectedField: { touched: false },
      },
    ],
    [actionTypes.SET_TOUCHED]: [
      {
        action: actions.setTouched,
        args: [],
        expectedField: { touched: true },
        expectedForm: { touched: true },
      },
    ],
    [actionTypes.SET_PENDING]: [
      {
        action: actions.setPending,
        args: [],
        expectedForm: {
          pending: true,
          retouched: false,
        },
        expectedField: {
          pending: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
        },
      },
      {
        action: actions.setPending,
        args: [],
        initialState: {
          $form: {
            ...initialFieldState,
            retouched: true,
          },
        },
        expectedForm: {
          pending: true,
        },
        expectedField: {
          pending: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
        },
      },
    ],
    [actionTypes.SET_VALIDITY]: [
      {
        action: actions.setValidity,
        args: [{ foo: true }],
        expectedField: {
          validity: { foo: true },
          errors: { foo: false },
          validated: true,
        },
      },
      {
        action: actions.setValidity,
        args: [{ foo: false }],
        expectedField: {
          validity: { foo: false },
          errors: { foo: true },
          validated: true,
        },
      },
      {
        action: actions.setValidity,
        args: [{ foo: false, bar: true }],
        expectedField: {
          validity: { foo: false, bar: true },
          errors: { foo: true, bar: false },
          validated: true,
        },
      },
      {
        label: 'validating the form (invalid)',
        action: actions.setValidity,
        model: 'user',
        args: [{ foo: false, bar: true }],
        expectedForm: {
          validity: { foo: false, bar: true },
          errors: { foo: true, bar: false },
          validated: true,
        },
      },
      {
        label: 'validating the form (valid)',
        action: actions.setValidity,
        model: 'user',
        args: [{ foo: true, bar: true }],
        expectedForm: {
          validity: { foo: true, bar: true },
          errors: { foo: false, bar: false },
          validated: true,
        },
      },
    ],
    [actionTypes.RESET_VALIDITY]: [
      {
        action: actions.resetValidity,
        model: 'user',
        initialState: {
          $form: {
            ...initialFieldState,
            valid: false,
            validity: { foo: false },
            errors: { foo: true },
          },
          name: {
            ...initialFieldState,
            valid: false,
            validity: { required: false },
            errors: { required: true },
          },
        },
        expectedField: {
          validity: {},
          errors: {},
          valid: true,
        },
        expectedForm: {
          validity: {},
          errors: {},
          valid: true,
        },
        expectedSubField: {
          validity: {},
          errors: {},
          valid: true,
        },
      },
    ],
    [actionTypes.SET_ERRORS]: [
      {
        label: '1',
        action: actions.setErrors,
        args: [{ foo: true }],
        expectedField: {
          validity: { foo: false },
          errors: { foo: true },
          validated: true,
        },
      },
      {
        label: '2',
        action: actions.setErrors,
        args: [{ foo: false }],
        expectedField: {
          validity: { foo: true },
          errors: { foo: false },
          validated: true,
        },
      },
      {
        label: '3',
        action: actions.setErrors,
        args: [{ foo: false, bar: true }],
        expectedField: {
          validity: { foo: true, bar: false },
          errors: { foo: false, bar: true },
          validated: true,
        },
      },
      {
        label: 'single string error message',
        action: actions.setErrors,
        args: ['single error message'],
        expectedField: {
          errors: 'single error message',
        },
      },
      {
        label: 'validating the form (invalid)',
        action: actions.setErrors,
        model: 'user',
        args: [{ foo: false, bar: true }],
        expectedForm: {
          validity: { foo: true, bar: false },
          errors: { foo: false, bar: true },
          validated: true,
        },
      },
      {
        label: 'validating the form (invalid)',
        action: actions.setErrors,
        model: 'user',
        args: [{ foo: true, bar: true }],
        expectedForm: {
          validity: { foo: false, bar: false },
          errors: { foo: true, bar: true },
          validated: true,
        },
      },
      {
        label: 'validating the form (valid)',
        action: actions.setErrors,
        model: 'user',
        args: [{ foo: false, bar: false }],
        expectedForm: {
          validity: { foo: true, bar: true },
          errors: { foo: false, bar: false },
          validated: true,
        },
      },
    ],
    [actionTypes.SET_FIELDS_VALIDITY]: [
      {
        action: actions.setFieldsValidity,
        model: 'user',
        args: [{ foo: false, bar: false }],
        expectedForm: (form) =>
          form.foo.errors === true
          && form.bar.errors === true,
      },
      {
        action: actions.setFieldsValidity,
        model: 'user.deep',
        args: [{ foo: false, bar: false }],
        expectedForm: (form) =>
          form.deep.foo.errors === true
          && form.deep.bar.errors === true,
      },
      {
        action: actions.setFieldsValidity,
        model: 'user',
        args: [{ foo: true, bar: true }, { errors: true }],
        expectedForm: (form) =>
          form.foo.errors === true
          && form.bar.errors === true,
      },
      {
        action: actions.setFieldsValidity,
        model: 'user.deep',
        args: [{ foo: true, bar: true }, { errors: true }],
        expectedForm: (form) =>
          form.deep.foo.errors === true
          && form.deep.bar.errors === true,
      },
      {
        label: 'form-wide boolean validity',
        action: actions.setFieldsValidity,
        model: 'user',
        args: [{ '': false }],
        expectedForm: (form) =>
          form.$form.errors === true
          && form.$form.valid === false,
      },
      {
        label: 'form-wide object errors validity',
        action: actions.setFieldsValidity,
        model: 'user',
        initialState: {
          $form: initialFieldState,
          name: {
            ...initialFieldState,
            valid: false,
            validity: false,
            errors: true,
          },
        },
        args: [{ '': { passMatch: true } }],
        expectedForm: (form) =>
          form.$form.validity.passMatch === true
          && form.$form.valid === false,
      },
    ],
    [actionTypes.SET_SUBMITTED]: [
      {
        action: actions.setSubmitted,
        args: [],
        expectedForm: (form) => selectForm(form).touched,
        expectedField: {
          pending: false,
          submitted: true,
          touched: true,
          retouched: false,
        },
      },
    ],
    [actionTypes.SET_SUBMIT_FAILED]: [
      {
        action: actions.setSubmitFailed,
        model: 'user',
        args: [],
        initialState: {
          $form: initialFieldState,
          name: initialFieldState,
          deep: {
            $form: initialFieldState,
            foo: initialFieldState,
            bar: initialFieldState,
          },
        },
        expectedForm: (form) => selectForm(form).touched,
        expectedField: {
          pending: false,
          submitted: false,
          submitFailed: true,
          touched: true,
          retouched: false,
        },
        expectedSubField: {
          pending: false,
          submitted: false,
          submitFailed: true,
          touched: true,
          retouched: false,
        },
      },
    ],
  };

  mapValues(formActionsSpec, (tests, actionType) => tests.forEach(({
    action,
    args = [],
    expectedForm,
    expectedField,
    expectedSubField,
    initialState = undefined,
    label = '',
    model = 'user.name',
  }) => {
    describe(`${actionType} action ${label}`, () => {
      const modelPath = toPath(model);
      const localModelPath = modelPath.slice(1);
      const localFormPath = localModelPath.slice(0, -1);

      const reducer = formReducer('user', { name: '' });
      const updatedState = reducer(initialState, action(model, ...args));

      if (expectedField) {
        it('should properly set the field state', () => {
          const updatedFieldState = localModelPath.length
            ? get(updatedState, localModelPath)
            : updatedState.$form;

          assert.containSubset(
            updatedFieldState,
            expectedField);
        });
      }

      if (expectedSubField) {
        it('should properly set the state of the child fields', () => {
          const localFieldsPath = localModelPath.slice(0, -1);

          const updatedFieldsState = localFieldsPath.length
            ? get(updatedState, localFieldsPath)
            : updatedState;

          function checkSubFields(subFields) {
            mapValues(subFields, (subField, key) => {
              if (key === '$form') return;

              if (subField.$form) {
                checkSubFields(subField);
              } else {
                assert.containSubset(
                  subField,
                  expectedSubField);
              }
            });
          }

          checkSubFields(updatedFieldsState);
        });
      }

      if (expectedForm) {
        const form = get(updatedState, localFormPath);

        it('should properly set the form state', () => {
          if (typeof expectedForm === 'function') {
            assert.ok(expectedForm(form));
          } else {
            assert.containSubset(
              form.$form,
              expectedForm);
          }
        });
      }
    });
  }));

  describe('valid state of parent forms', () => {
    const reducer = formReducer('test', {
      foo: 'foo',
      meta: {
        bar: 'deep',
      },
    });

    const invalidFoo = reducer(undefined,
      actions.setValidity('test.foo', false));

    it('parent form should be invalid if child is invalid', () => {
      assert.isFalse(invalidFoo.$form.valid);
      assert.isFalse(invalidFoo.foo.valid);
    });

    const invalidFooBar = reducer(invalidFoo,
      actions.setValidity('test.meta.bar', false));

    it('parent form should remain invalid if grandchild is invalid', () => {
      assert.isFalse(invalidFooBar.$form.valid);
      assert.isFalse(invalidFooBar.foo.valid);
      assert.isFalse(invalidFooBar.meta.bar.valid);
    });

    const focusedNewField = reducer(invalidFooBar,
      actions.focus('test.meta.new', true));

    it('parent form should remain invalid if new field dynamically added', () => {
      assert.isFalse(focusedNewField.$form.valid);
      assert.isFalse(focusedNewField.foo.valid);
      assert.isFalse(focusedNewField.meta.bar.valid);
      assert.isTrue(focusedNewField.meta.new.valid);
    });

    const invalidFooValidBar = reducer(focusedNewField,
      actions.setValidity('test.meta.bar', true));

    it('parent form should remain invalid if only grandchild is valid', () => {
      assert.isFalse(invalidFooValidBar.$form.valid);
      assert.isFalse(invalidFooValidBar.foo.valid);
      assert.isTrue(invalidFooValidBar.meta.$form.valid);
      assert.isTrue(invalidFooValidBar.meta.bar.valid);
    });

    const validFooValidBar = reducer(invalidFooValidBar,
      actions.setValidity('test.foo', true));

    it('parent form should be valid if all descendants are valid', () => {
      assert.isTrue(validFooValidBar.foo.valid);
      assert.isTrue(validFooValidBar.meta.$form.valid);
      assert.isTrue(validFooValidBar.meta.bar.valid);
      assert.isTrue(validFooValidBar.$form.valid);
    });
  });

  describe('deep resetting', () => {
    it('resetting a parent field should reset child fields in form', () => {
      const reducer = formReducer('test', {
        foo: '',
        meta: {
          bar: '',
        },
      });

      const changedState = reducer(undefined, actions.change('test', {
        foo: 'changed foo',
        meta: { bar: 'changed bar' },
      }));
      const resetState = reducer(changedState, actions.reset('test'));

      assert.equal(resetState.foo.value, '');
      assert.equal(resetState.meta.bar.value, '');
    });

    it('resetting a parent field should reset complex child fields', () => {
      const reducer = formReducer('test', {
        foo: [],
        meta: {
          bar: [],
        },
      });

      const changedState = reducer(undefined, actions.change('test', {
        foo: [1, 2, 3],
        meta: { bar: [1, 2, 3] },
      }));
      const resetState = reducer(changedState, actions.reset('test'));

      assert.deepEqual(resetState.foo.$form.value, []);
      assert.deepEqual(resetState.meta.bar.$form.value, []);
    });
  });

  describe('resetting after load', () => {
    const reducer = formReducer('test', {
      foo: '',
    });

    const loadedState = reducer(undefined,
      actions.load('test.foo', 'new loaded'));

    it('should change the loaded value for the field', () => {
      assert.equal(loadedState.foo.loadedValue, 'new loaded');
      assert.equal(loadedState.foo.value, 'new loaded');
    });

    it('should change the loaded value for the form', () => {
      assert.deepEqual(loadedState.$form.loadedValue, { foo: 'new loaded' });
      assert.deepEqual(loadedState.$form.value, { foo: 'new loaded' });
    });

    it('resetting a parent field should reset child fields in form', () => {
      const resetState = reducer(loadedState, actions.reset('test'));

      assert.deepEqual(resetState.$form.value, { foo: 'new loaded' });
      assert.equal(resetState.foo.value, 'new loaded');
    });
  });

  describe('resetting to null', () => {
    it('should work and not cause an infinite loop', () => {
      assert.doesNotThrow(() => {
        const reducer = formReducer('foo', null);

        const state = reducer(
           undefined,
           actions.reset('foo')
        );

        assert.containSubset(state, {
          value: null,
        });
      });
    });
  });
});
