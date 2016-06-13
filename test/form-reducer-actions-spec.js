import { assert } from 'chai';
import { actions, actionTypes, initialFieldState } from '../src';
import formReducer from '../src/reducers/v1-form-reducer';
import mapValues from 'lodash/mapValues';
import toPath from 'lodash/toPath';
import get from 'lodash/get';

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
    ],
    [actionTypes.FOCUS]: [
      {
        action: actions.focus,
        args: [],
        expectedForm: { focus: true },
        expectedField: { focus: true },
      },
    ],
    [actionTypes.SET_PRISTINE]: [
      {
        action: actions.setPristine,
        args: [],
        expectedForm: { pristine: true },
        expectedField: { pristine: true },
      },
    ],
    [actionTypes.SET_DIRTY]: [
      {
        action: actions.setDirty,
        args: [],
        expectedForm: { pristine: false },
        expectedField: { pristine: false },
      },
    ],
    [actionTypes.BLUR]: [
      {
        action: actions.blur,
        args: [],
        expectedForm: {
          focus: false,
          touched: true,
        },
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
        expectedForm: {
          focus: false,
          touched: true,
          submitted: true,
          retouched: true,
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
        expectedForm: { touched: true },
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
    [actionTypes.SET_SUBMITTED]: [
      {
        action: actions.setSubmitted,
        args: [],
        expectedForm: {
          touched: true,
        },
        expectedField: {
          pending: false,
          submitted: true,
          submitFailed: false,
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
        expectedForm: {
          touched: true,
        },
        expectedField: {
          pending: false,
          submitted: false,
          submitFailed: true,
          touched: true,
          retouched: false,
        },
        expectedSubField: {
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
      const localFormPath = localModelPath.slice(0, -1).concat(['$form']);

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
        it('should properly set the form state', () => {
          assert.containSubset(
            get(updatedState, localFormPath),
            expectedForm);
        });
      }
    });
  }));
});
