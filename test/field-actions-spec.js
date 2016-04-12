import { assert } from 'chai';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import { actions, actionTypes, formReducer, initialFieldState } from '../src';

describe('field actions', () => {
  describe('setViewValue()', () => {
    it('should set the view value of the field', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setViewValue('test.foo', 'bar'))
          .fields.foo,
        {
          viewValue: 'bar',
        });
    });
  });

  describe('reset()', () => {
    it('should set the field to the initial field state', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.reset('test.foo'))
          .fields.foo,
        initialFieldState);
    });

    it('should be able to set the entire form to the initial state', () => {
      const reducer = formReducer('test', { foo: 'bar' });

      const localInitialFormState = reducer(undefined, 'BOGUS / INITIAL STATE');

      assert.containSubset(
        reducer({ modified: 'form' }, actions.reset('test')),
        localInitialFormState);
    });

    it('should reset all errors on the field', () => {
      const reducer = formReducer('test');

      const stateWithErrors = reducer(undefined, actions.setValidity('test.foo', {
        valid: false,
        required: true,
      }));

      assert.deepEqual(stateWithErrors.fields.foo.errors, {
        valid: true,
        required: false,
      });

      const stateAfterReset = reducer(stateWithErrors, actions.reset('test.foo'));

      assert.deepEqual(stateAfterReset.fields.foo.errors, {});
    });

    it('should reset all errors on the form', () => {
      const reducer = formReducer('test');

      const stateWithErrors = reducer(undefined, actions.setValidity('test', {
        valid: false,
        required: true,
      }));

      assert.deepEqual(stateWithErrors.errors, {
        valid: true,
        required: false,
      });

      const stateAfterReset = reducer(stateWithErrors, actions.reset('test'));

      assert.deepEqual(stateAfterReset.errors, {});
    });
  });

  describe('focus()', () => {
    it('should set the focus state of the field to true and the blur state to false', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.focus('test.foo'))
          .fields.foo,
        {
          focus: true,
          blur: false,
        });
    });
  });

  describe('blur()', () => {
    it('should set the blur state of the field to true and the focus state to false', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.blur('test.foo'))
          .fields.foo,
        {
          blur: true,
          focus: false,
          touched: true,
          untouched: false,
        });
    });
  });

  describe('setPristine()', () => {
    it('should set the pristine state of the field to true and the dirty state to false', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setPristine('test.foo'))
          .fields.foo,
        {
          pristine: true,
          dirty: false,
        });
    });

    it('should set the pristine state of the form to true and the dirty state to false if every ' +
      'field is pristine', () => {
      const reducer = formReducer('test');

      const actualPristine = reducer(undefined, actions.setPristine('test.foo'));

      assert.containSubset(
        actualPristine,
        {
          pristine: true,
          dirty: false,
        });

      const actualDirty = reducer(actualPristine, actions.setDirty('test.bar'));

      assert.containSubset(
        actualDirty,
        {
          pristine: false,
          dirty: true,
        });

      const actualMultiplePristine = reducer(actualDirty, actions.setPristine('test.bar'));

      assert.containSubset(
        actualMultiplePristine,
        {
          pristine: true,
          dirty: false,
        });
    });

    it('should be able to set the pristine state of the form and each field to true', () => {
      const reducer = formReducer('test');

      const dirtyFormAndField = reducer(undefined, actions.setDirty('test.foo'));

      assert.containSubset(
        reducer(dirtyFormAndField, actions.setPristine('test')),
        {
          pristine: true,
          dirty: false,
        });

      assert.containSubset(
        reducer(dirtyFormAndField, actions.setPristine('test'))
          .fields.foo,
        {
          pristine: true,
          dirty: false,
        });
    });
  });

  describe('setDirty()', () => {
    it('should set dirty state of field to true & pristine state to false', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setDirty('test.foo'))
          .fields.foo,
        {
          dirty: true,
          pristine: false,
        });
    });

    it('should set dirty state of form to true & pristine state to false', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setDirty('test.foo')),
        {
          dirty: true,
          pristine: false,
        });
    });
  });

  describe('setPending()', () => {
    it('should set the pending state of the field to true and the submitted state to false', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setPending('test.foo'))
          .fields.foo,
        {
          pending: true,
          submitted: false,
        });
    });

    it('should set the pending state of the field to the specified state', () => {
      const reducer = formReducer('test');

      const actualPending = reducer(undefined, actions.setPending('test.foo', true));

      assert.containSubset(
        actualPending
          .fields.foo,
        {
          pending: true,
          submitted: false,
        });

      const actualNotPending = reducer(actualPending, actions.setPending('test.foo', false));

      assert.containSubset(
        actualNotPending
          .fields.foo,
        {
          pending: false,
          submitted: false,
        });
    });

    it('should work with forms', () => {
      const reducer = formReducer('test');

      const actualPending = reducer(undefined, actions.setPending('test'));

      assert.containSubset(
        actualPending,
        {
          pending: true,
          submitted: false,
        });

      assert.containSubset(
        reducer(actualPending, actions.setPending('test', false)),
        {
          pending: false,
          submitted: false,
        });
    });
  });

  describe('setSubmitted()', () => {
    it('should set the submitted state of the field to true and the pending state to false', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setSubmitted('test.foo'))
          .fields.foo,
        {
          submitted: true,
          pending: false,
          touched: true,
        });
    });

    it('should set the submitted state of the field to the specified state', () => {
      const reducer = formReducer('test');

      const actualSubmitted = reducer(undefined, actions.setSubmitted('test.foo', true));

      assert.containSubset(
        actualSubmitted
          .fields.foo,
        {
          submitted: true,
          pending: false,
          touched: true,
        });

      const actualNotSubmitted = reducer(actualSubmitted, actions.setSubmitted('test.foo', false));

      assert.containSubset(
        actualNotSubmitted
          .fields.foo,
        {
          submitted: false,
          pending: false,
          touched: true,
        });
    });

    it('should work with forms', () => {
      const reducer = formReducer('test');

      const actualSubmitted = reducer(undefined, actions.setSubmitted('test', true));

      assert.containSubset(
        actualSubmitted,
        {
          submitted: true,
          pending: false,
        });

      const actualNotSubmitted = reducer(actualSubmitted, actions.setSubmitted('test', false));

      assert.containSubset(
        actualNotSubmitted,
        {
          submitted: false,
          pending: false,
        });
    });
  });

  describe('setSubmitFailed()', () => {
    it('should set the submitFailed property to true', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setSubmitFailed('test')),
        {
          submitFailed: true,
          submitted: false,
          pending: false,
        });
    });

    it('should set the submitFailed property to false after successful submit', () => {
      const reducer = formReducer('test');
      const state = reducer(undefined, actions.setSubmitFailed('test'));

      assert.containSubset(
        reducer(state, actions.setSubmitted('test')),
        {
          submitFailed: false,
          submitted: true,
          pending: false,
        });
    });

    it('should set the submitFailed property to false while pending', () => {
      const reducer = formReducer('test');
      const state = reducer(undefined, actions.setSubmitFailed('test'));

      assert.containSubset(
        reducer(state, actions.setPending('test')),
        {
          submitFailed: false,
          submitted: false,
          pending: true,
        });
    });

    it('should set pending and submitted to false', () => {
      const reducer = formReducer('test');
      let state = reducer(undefined, actions.setPending('test'));

      assert.containSubset(
        reducer(state, actions.setSubmitFailed('test')),
        {
          submitFailed: true,
          submitted: false,
          pending: false,
        }, 'should set pending to false');

      state = reducer(state, actions.setSubmitted('test'));

      assert.containSubset(
        reducer(state, actions.setSubmitFailed('test')),
        {
          submitFailed: true,
          submitted: false,
          pending: false,
        }, 'should set submitted to false');
    });
  });

  describe('setTouched()', () => {
    it('should set the touched and blurred state of the field to true ' +
      'and the untouched and focused state to false', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setTouched('test.foo'))
          .fields.foo,
        {
          touched: true,
          untouched: false,
          retouched: false,
          focus: false,
          blur: true,
        });
    });

    it('should set the retouched property to true upon touch after submit', () => {
      const reducer = formReducer('test');
      const state = reducer(undefined, actions.setSubmitted('test'));

      assert.containSubset(
        state,
        {
          submitted: true,
          retouched: false,
        }, 'not retouched yet');

      assert.containSubset(
        reducer(state, actions.setTouched('test')),
        {
          submitted: true,
          retouched: true,
        }, 'retouched after submit');
    });

    it('should set the retouched property to true upon touch after submit failed', () => {
      const reducer = formReducer('test');
      const state = reducer(undefined, actions.setSubmitFailed('test'));

      assert.containSubset(
        state,
        {
          submitted: false,
          submitFailed: true,
          retouched: false,
        }, 'not retouched yet');

      assert.containSubset(
        reducer(state, actions.setTouched('test')),
        {
          submitted: false,
          submitFailed: true,
          retouched: true,
        }, 'retouched after submit failed');
    });

    it('should set the retouched property to false when pending', () => {
      const reducer = formReducer('test');
      let state = reducer(undefined, actions.setSubmitted('test'));

      state = reducer(state, actions.setTouched('test'));

      assert.containSubset(
        state,
        {
          submitted: true,
          retouched: true,
        }, 'retouched after submit and before pending');

      state = reducer(state, actions.setPending('test'));

      assert.containSubset(
        state,
        {
          pending: true,
          submitted: false,
          retouched: false,
        }, 'not retouched while pending');
    });
  });

  describe('setUntouched()', () => {
    it('should set the untouched state of the field to true and the touched state to false', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setUntouched('test.foo'))
          .fields.foo,
        {
          untouched: true,
          touched: false,
        });
    });
  });

  describe('setValidity()', () => {
    it('should set the errors state of the field the inverse of a boolean validity', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setValidity('test.foo', true))
          .fields.foo,
        {
          errors: false,
        });

      assert.containSubset(
        reducer(undefined, actions.setValidity('test.foo', false))
          .fields.foo,
        {
          errors: true,
        });
    });

    it('should set the errors state of the field the inverse of each value of a validity object',
      () => {
        const reducer = formReducer('test');

        const validity = {
          good: true,
          bad: false,
        };

        assert.containSubset(
          reducer(undefined, actions.setValidity('test.foo', validity))
            .fields.foo,
          {
            errors: {
              good: false,
              bad: true,
            },
          });
      });

    it('should set the valid state to true if all values in validity object are true', () => {
      const reducer = formReducer('test');

      const validity = {
        one: true,
        two: true,
      };

      const actualForm = reducer(undefined, actions.setValidity('test.foo', validity));

      assert.containSubset(
        actualForm.fields.foo,
        {
          valid: true,
        });

      assert.containSubset(
        actualForm,
        {
          valid: true,
        }, 'form should be valid if all fields are valid');
    });

    it('should set the valid state to false if any value in validity object are false', () => {
      const reducer = formReducer('test');

      const validity = {
        one: true,
        two: true,
        three: false,
      };

      const actualForm = reducer(undefined, actions.setValidity('test.foo', validity));

      assert.containSubset(
        actualForm.fields.foo,
        {
          valid: false,
        });

      assert.containSubset(
        actualForm,
        {
          valid: false,
        }, 'form should be invalid if any fields are invalid');
    });

    it('should be able to set the validity of a form', () => {
      const reducer = formReducer('test');

      const validity = {
        foo: true,
        baz: false,
      };

      const actual = reducer(
        undefined,
        actions.setValidity('test', validity));

      assert.containSubset(
        actual,
        {
          valid: false,
          errors: {
            foo: false,
            baz: true,
          },
        });
    });

    it('should be able to set the validity to a non-boolean value', () => {
      const reducer = formReducer('test');

      const validity = {
        foo: 'truthy string',
        baz: null, // false value
      };

      let actual = reducer(
        undefined,
        actions.setValidity('test', validity));

      assert.containSubset(
        actual,
        {
          valid: false,
          validity: {
            foo: 'truthy string',
            baz: null,
          },
          errors: {
            foo: false,
            baz: true,
          },
        });

      actual = reducer(actual, actions.setValidity('test', {
        foo: false,
      }));

      assert.containSubset(
        actual,
        {
          valid: false,
          validity: {
            foo: false,
            baz: null,
          },
          errors: {
            foo: true,
            baz: true,
          },
        });

      actual = reducer(actual, actions.setValidity('test', {
        foo: 'truthy string',
        baz: 100,
      }));

      assert.containSubset(
        actual,
        {
          valid: true,
          validity: {
            foo: 'truthy string',
            baz: 100,
          },
          errors: {
            foo: false,
            baz: false,
          },
        });
    });
  });

  describe('setErrors()', () => {
    it('should set the errors state of the field', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setErrors('test.foo', true))
          .fields.foo,
        {
          errors: true,
          validity: false,
          valid: false,
        });

      assert.containSubset(
        reducer(undefined, actions.setErrors('test.foo', false))
          .fields.foo,
        {
          errors: false,
          validity: true,
          valid: true,
        });
    });

    it('should set the errors state of the field', () => {
      const reducer = formReducer('test');

      const errors = {
        good: true,
        bad: false,
      };

      assert.containSubset(
        reducer(undefined, actions.setErrors('test.foo', errors))
          .fields.foo,
        {
          errors: {
            good: true,
            bad: false,
          },
          valid: false,
          validity: {
            good: false,
            bad: true,
          },
        });
    });

    it('should set the valid state to true if all values in error object are false', () => {
      const reducer = formReducer('test');

      const errors = {
        one: false,
        two: null,
        three: 0,
      };

      const actualForm = reducer(undefined, actions.setErrors('test.foo', errors));

      assert.containSubset(
        actualForm.fields.foo,
        {
          valid: true,
          validity: {
            one: true,
            two: true,
            three: true,
          },
        });

      assert.containSubset(
        actualForm,
        {
          valid: true,
        }, 'form should be valid if all fields are valid');
    });

    it('should set the valid state to false if any value in error object is true', () => {
      const reducer = formReducer('test');

      const errors = {
        one: true,
        two: false,
        three: false,
      };

      const actualForm = reducer(undefined, actions.setErrors('test.foo', errors));

      assert.containSubset(
        actualForm.fields.foo,
        {
          valid: false,
          errors: {
            one: true,
            two: false,
            three: false,
          },
          validity: {
            one: false,
            two: true,
            three: true,
          },
        });

      assert.containSubset(
        actualForm,
        {
          valid: false,
        }, 'form should be invalid if any fields are invalid');
    });

    it('should be able to set the errors of a form', () => {
      const reducer = formReducer('test');

      const errors = {
        foo: true,
        baz: false,
      };

      const actual = reducer(
        undefined,
        actions.setErrors('test', errors));

      assert.containSubset(
        actual,
        {
          valid: false,
          errors: {
            foo: true,
            baz: false,
          },
        });
    });

    it('should be able to set the errors to an object', () => {
      const reducer = formReducer('test');

      const errors = {
        foo: 'foo is required',
        baz: null, // falsey value
      };

      let actual = reducer(
        undefined,
        actions.setErrors('test', errors));

      assert.containSubset(
        actual,
        {
          valid: false,
          validity: {
            foo: false,
            baz: true,
          },
          errors: {
            foo: 'foo is required',
            baz: null,
          },
        });

      actual = reducer(actual, actions.setErrors('test', {
        foo: false,
      }));

      assert.containSubset(
        actual,
        {
          valid: true,
          validity: {
            foo: true,
            baz: true,
          },
          errors: {
            foo: false,
            baz: null,
          },
        });

      actual = reducer(actual, actions.setErrors('test', {
        foo: 'foo is required',
        baz: 'baz is also required',
      }));

      assert.containSubset(
        actual,
        {
          valid: false,
          validity: {
            foo: false,
            baz: false,
          },
          errors: {
            foo: 'foo is required',
            baz: 'baz is also required',
          },
        });
    });

    it('should be able to set the errors to a string', () => {
      const reducer = formReducer('test');

      const errors = 'This whole thing is invalid';
      const fieldErrors = 'This field is invalid';

      let actual = reducer(
        undefined,
        actions.setErrors('test', errors));

      assert.containSubset(
        actual,
        {
          errors,
          valid: false,
          validity: false,
        });

      actual = reducer(
        actual,
        actions.setErrors('test', false));

      assert.containSubset(
        actual,
        {
          errors: false,
          valid: true,
          validity: true,
        });

      let actualField = reducer(
        undefined,
        actions.setErrors('test.foo', fieldErrors));

      assert.containSubset(
        actualField.fields.foo,
        {
          errors: fieldErrors,
          valid: false,
          validity: false,
        });

      assert.isFalse(actualField.valid);

      actualField = reducer(
        actualField,
        actions.setErrors('test.foo', false));

      assert.containSubset(
        actualField.fields.foo,
        {
          errors: false,
          valid: true,
          validity: true,
        });

      assert.isTrue(actualField.valid);
    });
  });

  describe('resetValidity() and resetErrors()', () => {
    const reducer = formReducer('test');

    it('should reset the validity and errors of a field state', () => {
      const stateWithErrors = reducer(
        undefined,
        actions.setErrors('test.foo', { bar: true, baz: true }));

      assert.containSubset(
        stateWithErrors.fields.foo,
        {
          valid: false,
          validity: { bar: false, baz: false },
          errors: { bar: true, baz: true },
        });

      const actualState = reducer(
        stateWithErrors,
        actions.resetValidity('test.foo'));

      assert.containSubset(
        actualState.fields.foo,
        {
          valid: true,
          validity: {},
          errors: {},
        });
    });

    it('should reset the validity and errors of a form', () => {
      const stateWithErrors = reducer(
        undefined,
        actions.setErrors('test.foo', { bar: true, baz: true }));

      const stateWithMoreErrors = reducer(
        stateWithErrors,
        actions.setErrors('test.bar', { foo: true, baz: true }));

      assert.containSubset(
        stateWithMoreErrors.fields.foo,
        {
          valid: false,
          validity: { bar: false, baz: false },
          errors: { bar: true, baz: true },
        });

      assert.containSubset(
        stateWithMoreErrors.fields.bar,
        {
          valid: false,
          validity: { foo: false, baz: false },
          errors: { foo: true, baz: true },
        });

      const actualState = reducer(
        stateWithMoreErrors,
        actions.resetValidity('test'));

      assert.containSubset(
        actualState,
        {
          valid: true,
          validity: {},
          errors: {},
        });

      assert.containSubset(
        actualState.fields.foo,
        {
          valid: true,
          validity: {},
          errors: {},
        });

      assert.containSubset(
        actualState.fields.bar,
        {
          valid: true,
          validity: {},
          errors: {},
        });
    });

    it('should be aliased to resetErrors()', () => {
      const stateWithErrors = reducer(
        undefined,
        actions.setErrors('test.foo', { bar: true, baz: true }));

      const actualState = reducer(
        stateWithErrors,
        actions.resetErrors('test.foo'));

      assert.containSubset(
        actualState.fields.foo,
        {
          valid: true,
          validity: {},
          errors: {},
        });
    });
  });

  describe('asyncSetValidity() (thunk)', () => {
    it('should asynchronously call setValidity() action', testDone => {
      const reducer = formReducer('test');
      const dispatch = action => {
        if (action.type === actionTypes.SET_VALIDITY) {
          testDone(assert.containSubset(
            reducer(undefined, action)
              .fields.foo,
            {
              valid: false,
              errors: {
                good: false,
                bad: true,
              },
            }));
        }
      };

      const getState = () => ({
        test: { foo: 5 },
      });

      const validator = (value, done) => done({
        good: value > 4,
        bad: value > 5,
      });

      actions.asyncSetValidity('test.foo', validator)(dispatch, getState);
    });

    it('should work with forms to asynchronously call setValidity() action', testDone => {
      const reducer = formReducer('test');
      const dispatch = action => {
        if (action.type === actionTypes.SET_VALIDITY) {
          testDone(assert.containSubset(
            reducer(undefined, action),
            {
              valid: false,
              errors: {
                good: false,
                bad: true,
              },
            }));
        }
      };

      const getState = () => ({
        test: { foo: 5 },
      });

      const validator = ({ foo }, done) => done({
        good: foo > 4,
        bad: foo > 5,
      });

      actions.asyncSetValidity('test', validator)(dispatch, getState);
    });

    it('should set pending to true for a field when validating, and false when done validating',
      testDone => {
        const pendingStates = [];
        const executedActions = [];

        const reducer = formReducer('test');
        const dispatch = action => {
          executedActions.push(action);
          const state = reducer(undefined, action);

          if (action.type === actionTypes.SET_PENDING) {
            pendingStates.push(action.pending);

            assert.equal(state.fields.foo.pending, action.pending);

            if (action.pending === false) {
              testDone(assert.deepEqual(
                pendingStates,
                [true, false]));
            }
          }
        };

        const getState = () => ({});

        const validator = (_, done) => done(true);

        actions.asyncSetValidity('test.foo', validator)(dispatch, getState);
      });

    it('should set pending to true for a form when validating, and false when done validating',
      testDone => {
        const pendingStates = [];
        const executedActions = [];

        const reducer = formReducer('test');
        const dispatch = action => {
          executedActions.push(action);
          const state = reducer(undefined, action);

          if (action.type === actionTypes.SET_PENDING) {
            pendingStates.push(action.pending);

            assert.equal(state.pending, action.pending);

            if (action.pending === false) {
              testDone(assert.deepEqual(
                pendingStates,
                [true, false]));
            }
          }
        };

        const getState = () => ({});

        const validator = (_, done) => done(true);

        actions.asyncSetValidity('test', validator)(dispatch, getState);
      });
  });

  describe('submit() (thunk)', () => {
    const submitPromise = value => new Promise((resolve, reject) => {
      if (value.valid) {
        return resolve(true);
      }

      return reject(value.errors);
    });

    const mockStore = configureMockStore([thunk]);

    it('should exist', () => {
      assert.isFunction(actions.submit);
    });

    it('should be able to resolve a form as valid', done => {
      const expectedActions = [
        { type: actionTypes.SET_PENDING, pending: true, model: 'test' },
        { type: actionTypes.SET_SUBMITTED, submitted: true, model: 'test' },
        { type: actionTypes.SET_VALIDITY, validity: true, model: 'test' },
      ];

      const store = mockStore(() => ({}), expectedActions, done);

      store.dispatch(actions.submit('test', submitPromise({ valid: true })));
    });

    it('should submit errors when form promise is rejected', done => {
      const errors = {
        foo: 'Foo is invalid',
        bar: 'Bar is also invalid',
      };

      const expectedActions = [
        { type: actionTypes.SET_PENDING, pending: true, model: 'test' },
        { type: actionTypes.SET_SUBMIT_FAILED, model: 'test' },
        { type: actionTypes.SET_ERRORS, errors, model: 'test' },
      ];

      const store = mockStore(() => ({}), expectedActions, done);

      store.dispatch(actions.submit('test', submitPromise({
        valid: false,
        errors,
      })));
    });
  });

  describe('validate() (thunk)', () => {
    const mockStore = configureMockStore([thunk]);

    it('should set the validity of a model with a validator function', (done) => {
      const store = mockStore(
        () => ({ test: { foo: 'bar' } }),
        [
          { model: 'test.foo', type: actionTypes.SET_VALIDITY, validity: false },
          { model: 'test.foo', type: actionTypes.SET_VALIDITY, validity: true },
        ],
        done);

      store.dispatch(actions.validate('test.foo', (val) => val === 'invalid'));
      store.dispatch(actions.validate('test.foo', (val) => val === 'bar'));
    });

    it('should set the validity of a model with a validation object', (done) => {
      const store = mockStore(
        () => ({ test: { foo: 'bar' } }),
        [
          {
            model: 'test.foo',
            type: actionTypes.SET_VALIDITY,
            validity: {
              good: true,
              bad: false,
            },
          },
        ],
        done);

      const validators = {
        good: (val) => val === 'bar',
        bad: (val) => val === 'invalid',
      };

      store.dispatch(actions.validate('test.foo', validators));
    });
  });

  describe('validateErrors() (thunk)', () => {
    const mockStore = configureMockStore([thunk]);

    it('should set the errors of a model with an error validator function', (done) => {
      const store = mockStore(
        () => ({ test: { foo: 'bar' } }),
        [
          { model: 'test.foo', type: actionTypes.SET_ERRORS, errors: 'Value is invalid' },
          { model: 'test.foo', type: actionTypes.SET_ERRORS, errors: 'Value is invalid again' },
          { model: 'test.foo', type: actionTypes.SET_ERRORS, errors: false },
        ],
        done);

      store.dispatch(actions.validateErrors('test.foo',
        (val) => val !== 'valid' && 'Value is invalid'));
      store.dispatch(actions.validateErrors('test.foo',
        (val) => val !== 'valid' && 'Value is invalid again'));
      store.dispatch(actions.validateErrors('test.foo',
        (val) => val !== 'bar' && 'This should return false'));
    });

    it('should allow any type of value as the error value', (done) => {
      const store = mockStore(
        () => ({ test: { foo: 'bar' } }),
        [
          { model: 'test.foo', type: actionTypes.SET_ERRORS, errors: [
            'length',
            'required',
          ] },
        ],
        done);

      store.dispatch(actions.validateErrors('test.foo',
        (val) => val !== 'valid' && ['length', 'required']));
    });

    it('should set the errors of a model with an error object', (done) => {
      const store = mockStore(
        () => ({ test: { foo: 'bar' } }),
        [
          {
            model: 'test.foo',
            type: actionTypes.SET_ERRORS,
            errors: {
              good: false,
              bad: 'Value is not valid',
            },
          },
        ],
        done);

      const errorValidators = {
        good: (val) => val !== 'bar' && 'This should not show',
        bad: (val) => val !== 'valid' && 'Value is not valid',
      };

      store.dispatch(actions.validateErrors('test.foo', errorValidators));
    });
  });

  describe('validateFields() (thunk)', () => {
    const mockStore = configureMockStore([thunk]);

    it('should set the validity of multiple fields in the same form', (done) => {
      const store = mockStore(
        () => ({ test: { foo: 'bar' } }),
        [
          {
            fieldsValidity: {
              '': true,
              foo: true,
              foo_invalid: false,
              foo_valid: true,
              with_keys: {
                key_invalid: false,
                key_valid: true,
              },
            },
            model: 'test',
            type: actionTypes.SET_FIELDS_VALIDITY,
          },
        ],
        done);

      const action = actions.validateFields('test', {
        '': (val) => val.foo === 'bar',
        foo: (val) => val === 'bar',
        foo_valid: () => true,
        foo_invalid: () => false,
        with_keys: {
          key_valid: () => true,
          key_invalid: () => false,
        },
      });

      store.dispatch(action);
    });

    it('should call a callback if validation passes', (done) => {
      const callback = sinon.spy((val) => val);

      const store = mockStore(
        () => ({ test: { foo: 'bar' } }),
        [{
          model: 'test',
          type: actionTypes.SET_FIELDS_VALIDITY,
          fieldsValidity: {
            foo: true,
          },
        }],
        () => {
          assert.isTrue(callback.calledOnce);
          done();
        });

      const action = actions.validateFields('test', {
        foo: (val) => val === 'bar',
      }, callback);

      store.dispatch(action);
    });

    it('should NOT call a callback if validation fails', (done) => {
      const callback = sinon.spy((val) => val);

      const store = mockStore(
        () => ({ test: { foo: 'bar' } }),
        [{
          model: 'test',
          type: actionTypes.SET_FIELDS_VALIDITY,
          fieldsValidity: {
            foo: false,
          },
        }],
        () => {
          assert.isTrue(callback.notCalled);
          done();
        });

      const action = actions.validateFields('test', {
        foo: (val) => val === 'invalid',
      }, callback);

      store.dispatch(action);
    });
  });
});
