import { assert } from 'chai';
import { actions, actionTypes, initialFieldState, getField } from '../src';
import formReducer from '../src/reducers/v1-form-reducer';
import mapValues from 'lodash/mapValues';

describe('formReducer() (V1)', () => {
  const nullAction = { type: '' };

  it('should exist as a function', () => {
    assert.isFunction(formReducer);
  });

  console.log(formReducer('test', { foo: '' })(undefined, actions.setSubmitFailed('test')));

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
  };

  mapValues(formActionsSpec, (tests, actionType) => tests.forEach(({
    action,
    args,
    expectedForm,
    expectedField,
    initialState = undefined,
  }) => {
    describe(`${actionType} action`, () => {
      const reducer = formReducer('user', { name: '' });

      const updatedState = reducer(initialState, action('user.name'));

      it('should properly set the field state', () => {
        assert.containSubset(updatedState.name, expectedField);
      });

      it('should properly set the form state', () => {
        assert.containSubset(updatedState.name, expectedForm);
      });
    });
  }));
});
