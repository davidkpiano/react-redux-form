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
          valid: false,
          validated: true,
        },
      },
    ],
  };

  mapValues(formActionsSpec, (tests, actionType) => tests.forEach(({
    action,
    args = [],
    expectedForm,
    expectedField,
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
          assert.containSubset(
            get(updatedState, localModelPath),
            expectedField);
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
