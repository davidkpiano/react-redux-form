import { assert } from 'chai';
import { actions, actionTypes, initialFieldState, getField } from '../src';
import formReducer from '../src/reducers/v1-form-reducer';
import mapValues from 'lodash/mapValues';

const red = formReducer('test', {name:''});
const st1 = red(undefined, actions.setSubmitted('test'));
console.log('FIRST -------\n', st1);
const st2 = red(st1, actions.blur('test.name'));
console.log('SECOND ------\n', st2);


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
  };

  mapValues(formActionsSpec, (tests, actionType) => tests.forEach(({
    action,
    args = [],
    expectedForm,
    expectedField,
    initialState = undefined,
    label = '',
  }) => {
    describe(`${actionType} action ${label}`, () => {
      const reducer = formReducer('user', { name: '' });

      if (label) console.log('yeehaw', initialState)

      const updatedState = reducer(initialState, action('user.name'));

      it('should properly set the field state', () => {
        assert.containSubset(updatedState.name, expectedField);
      });

      it('should properly set the form state', () => {
        assert.containSubset(updatedState.$form, expectedForm);
      });
    });
  }));
});
