import { assert } from 'chai';
import {
  actions,
  actionTypes,
  initialFieldState,
  form as selectForm,
  formReducer,
} from '../src';
import mapValues from 'lodash/mapValues';
import toPath from 'lodash/toPath';
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
      },
      {
        action: actions.change,
        args: ['string', { silent: true }],
        expectedField: {
          pristine: true,
          value: 'string',
          initialValue: 'string',
        },
      },
      {
        action: actions.change,
        args: [42, { silent: true }],
        expectedField: {
          pristine: true,
          value: 42,
          initialValue: 42,
        },
      },
      {
        action: actions.change,
        args: [{ foo: 'bar' }, { silent: true }],
        expectedField: {
          pristine: true,
          value: { foo: 'bar' },
          initialValue: { foo: 'bar' },
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

          mapValues(updatedFieldsState, (field, key) => {
            if (key === '$form') return;

            assert.containSubset(
              field,
              expectedSubField);
          });
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

    it('resetting a parent field should reset child fields in form', () => {
      const resetState = reducer(changedState, actions.reset('test'));

      assert.equal(resetState.foo.value, '');
      assert.equal(resetState.meta.bar.value, '');
    });
  });

  describe('resetting after load', () => {
    const reducer = formReducer('test', {
      foo: '',
    });

    const loadedState = reducer(undefined,
      actions.load('test.foo', 'new initial'));

    it('should change the initial value for the field', () => {
      assert.equal(loadedState.foo.initialValue, 'new initial');
      assert.equal(loadedState.foo.value, 'new initial');
    });

    it('should change the initial value for the form', () => {
      assert.deepEqual(loadedState.$form.initialValue, { foo: 'new initial' });
      assert.deepEqual(loadedState.$form.value, { foo: 'new initial' });
    });

    it('resetting a parent field should reset child fields in form', () => {
      const resetState = reducer(loadedState, actions.reset('test'));

      assert.deepEqual(resetState.$form.value, { foo: 'new initial' });
      assert.equal(resetState.foo.value, 'new initial');
    });
  });
});
