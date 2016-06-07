import { assert } from 'chai';
import { actions, actionTypes, initialFieldState, getField } from '../src';
import formReducer from '../src/reducers/v1-form-reducer';
import mapValues from 'lodash/mapValues';
import toPath from 'lodash/toPath';
import get from 'lodash/get';

describe.only('formReducer() (V1)', () => {
  const nullAction = { type: '' };

  it('should exist as a function', () => {
    assert.isFunction(formReducer);
  });

  const formActionsSpec = {
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
          }
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
        expectedForm: { valid: true },
        expectedField: {
          validity: { foo: true },
          errors: { foo: false },
          valid: true,
          validated: true,
        },
      },
      {
        action: actions.setValidity,
        args: [{ foo: false }],
        expectedForm: { valid: false },
        expectedField: {
          validity: { foo: false },
          errors: { foo: true },
          valid: false,
          validated: true,
        },
      },
      {
        action: actions.setValidity,
        args: [{ foo: false, bar: true }],
        expectedForm: { valid: false },
        expectedField: {
          validity: { foo: false, bar: true },
          errors: { foo: true, bar: false },
          valid: false,
          validated: true,
        },
      },
      {
        label: 'validating the form (invalid)',
        action: actions.setValidity,
        model: 'user',
        args: [{ foo: false, bar: true }],
        expectedForm: {
          valid: false,
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
          valid: true,
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
            if (key === '$form') return true;

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
