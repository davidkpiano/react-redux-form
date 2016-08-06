import { assert } from 'chai';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import { actions, actionTypes, formReducer, initialFieldState } from '../src';
import isValid from '../src/form/is-valid';
import isPristine from '../src/form/is-pristine';
import isRetouched from '../src/form/is-retouched';

describe('field actions', () => {
  describe('change()', () => {
    it('should set the retouched property to true upon change after submit', () => {
      const reducer = formReducer('test', { foo: '' });
      const state = reducer(undefined, actions.setSubmitted('test'));

      assert.containSubset(
        state.$form,
        {
          submitted: true,
          retouched: false,
        }, 'not retouched yet');

      const changedState = reducer(state, actions.change('test.foo', 'new'));

      assert.containSubset(
        changedState.$form,
        {
          submitted: true,
        });

      assert.isTrue(isRetouched(changedState), 'form retouched after submit');

      assert.containSubset(
        changedState.foo,
        {
          retouched: true,
        }, 'field retouched after submit');
    });
  });

  describe('reset()', () => {
    it('should set the field to the initial field state', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.reset('test.foo'))
          .foo,
        initialFieldState);
    });

    it('should be able to set the entire form to the initial state', () => {
      const reducer = formReducer('test', { foo: 'bar' });

      const localInitialFormState = reducer(undefined, 'BOGUS / INITIAL STATE');

      assert.containSubset(
        reducer(undefined, actions.reset('test')),
        localInitialFormState);
    });

    it('should reset all errors on the field', () => {
      const reducer = formReducer('test');

      const stateWithErrors = reducer(undefined, actions.setValidity('test.foo', {
        valid: false,
        required: true,
      }));

      assert.deepEqual(stateWithErrors.foo.errors, {
        valid: true,
        required: false,
      });

      const stateAfterReset = reducer(stateWithErrors, actions.reset('test.foo'));

      assert.deepEqual(stateAfterReset.foo.errors, {});
    });

    it('should reset all errors on the form', () => {
      const reducer = formReducer('test');

      const stateWithErrors = reducer(undefined, actions.setValidity('test', {
        valid: false,
        required: true,
      }));

      assert.deepEqual(stateWithErrors.$form.errors, {
        valid: true,
        required: false,
      });

      assert.deepEqual(stateWithErrors.$form.validity, {
        valid: false,
        required: true,
      });

      const stateAfterReset = reducer(stateWithErrors, actions.reset('test'));

      assert.deepEqual(stateAfterReset.$form.errors, {});
    });
  });

  describe('focus()', () => {
    it('should set the focus state of the field to true', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.focus('test.foo'))
          .foo,
        {
          focus: true,
        });
    });
  });

  describe('blur()', () => {
    it('should set the focus state to false', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.blur('test.foo'))
          .foo,
        {
          focus: false,
          touched: true,
        });
    });
  });

  describe('setPristine()', () => {
    it('should set the pristine state of the field to true', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setPristine('test.foo'))
          .foo,
        {
          pristine: true,
        });
    });

    it('should set the pristine state of the form to true if every ' +
      'field is pristine', () => {
      const reducer = formReducer('test');

      const actualPristine = reducer(undefined, actions.setPristine('test.foo'));

      assert.containSubset(
        actualPristine.$form,
        {
          pristine: true,
        });

      const actualDirty = reducer(actualPristine, actions.setDirty('test.bar'));

      assert.isFalse(isPristine(actualDirty));

      const actualMultiplePristine = reducer(actualDirty, actions.setPristine('test.bar'));

      assert.isTrue(isPristine(actualMultiplePristine));
    });

    it('should be able to set the pristine state of the form and each field to true', () => {
      const reducer = formReducer('test');

      const dirtyFormAndField = reducer(undefined, actions.setDirty('test.foo'));

      const pristineFormAndField = reducer(dirtyFormAndField, actions.setPristine('test'));

      assert.isTrue(isPristine(pristineFormAndField));

      assert.containSubset(
        pristineFormAndField.foo,
        {
          pristine: true,
        });
    });
  });

  describe('setDirty()', () => {
    it('should set pristine state to false', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setDirty('test.foo'))
          .foo,
        {
          pristine: false,
        });
    });

    it('should set pristine form state to false', () => {
      const reducer = formReducer('test');

      const actual = reducer(undefined, actions.setDirty('test.foo'));

      assert.isFalse(isPristine(actual));
    });
  });

  describe('setPending()', () => {
    it('should set the pending state of the field to true and the submitted state to false', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setPending('test.foo'))
          .foo,
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
          .foo,
        {
          pending: true,
          submitted: false,
        });

      const actualNotPending = reducer(actualPending, actions.setPending('test.foo', false));

      assert.containSubset(
        actualNotPending
          .foo,
        {
          pending: false,
          submitted: false,
        });
    });

    it('should work with forms', () => {
      const reducer = formReducer('test');

      const actualPending = reducer(undefined, actions.setPending('test'));

      assert.containSubset(
        actualPending.$form,
        {
          pending: true,
          submitted: false,
        });

      assert.containSubset(
        reducer(actualPending, actions.setPending('test', false))
          .$form,
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
          .foo,
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
          .foo,
        {
          submitted: true,
          pending: false,
          touched: true,
        });

      const actualNotSubmitted = reducer(actualSubmitted, actions.setSubmitted('test.foo', false));

      assert.containSubset(
        actualNotSubmitted
          .foo,
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
        actualSubmitted.$form,
        {
          submitted: true,
          pending: false,
        });

      const actualNotSubmitted = reducer(actualSubmitted, actions.setSubmitted('test', false));

      assert.containSubset(
        actualNotSubmitted.$form,
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
        reducer(undefined, actions.setSubmitFailed('test'))
          .$form,
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
        reducer(state, actions.setSubmitted('test'))
          .$form,
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
        reducer(state, actions.setPending('test'))
          .$form,
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
        reducer(state, actions.setSubmitFailed('test'))
          .$form,
        {
          submitFailed: true,
          submitted: false,
          pending: false,
        }, 'should set pending to false');

      state = reducer(state, actions.setSubmitted('test'));

      assert.containSubset(
        reducer(state, actions.setSubmitFailed('test'))
          .$form,
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
          .foo,
        {
          touched: true,
          retouched: false,
          focus: false,
        });
    });

    it('should set the retouched property to true upon touch after submit', () => {
      const reducer = formReducer('test');
      const state = reducer(undefined, actions.setSubmitted('test'));

      assert.containSubset(
        state.$form,
        {
          submitted: true,
          retouched: false,
        }, 'not retouched yet');

      assert.containSubset(
        reducer(state, actions.setTouched('test'))
          .$form,
        {
          submitted: true,
          retouched: true,
        }, 'retouched after submit');
    });

    it('should set the retouched property to true upon touch after submit failed', () => {
      const reducer = formReducer('test');
      const state = reducer(undefined, actions.setSubmitFailed('test'));

      assert.containSubset(
        state.$form,
        {
          submitted: false,
          submitFailed: true,
          retouched: false,
        }, 'not retouched yet');

      assert.containSubset(
        reducer(state, actions.setTouched('test'))
          .$form,
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
        state.$form,
        {
          submitted: true,
          retouched: true,
        }, 'retouched after submit and before pending');

      state = reducer(state, actions.setPending('test'));

      assert.containSubset(
        state.$form,
        {
          pending: true,
          submitted: false,
          retouched: false,
        }, 'not retouched while pending');
    });
  });

  describe('setUntouched()', () => {
    it('should set the touched state to false', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setUntouched('test.foo'))
          .foo,
        {
          touched: false,
        });
    });
  });

  describe('setValidity()', () => {
    it('should set the errors state of the field the inverse of a boolean validity', () => {
      const reducer = formReducer('test');

      assert.containSubset(
        reducer(undefined, actions.setValidity('test.foo', true))
          .foo,
        {
          errors: false,
        });

      assert.containSubset(
        reducer(undefined, actions.setValidity('test.foo', false))
          .foo,
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
            .foo,
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

      assert.isTrue(isValid(actualForm.foo));

      assert.isTrue(isValid(actualForm), 'form should be valid if all fields are valid');
    });

    it('should set the valid state to false if any value in validity object are false', () => {
      const reducer = formReducer('test');

      const validity = {
        one: true,
        two: true,
        three: false,
      };

      const actualForm = reducer(undefined, actions.setValidity('test.foo', validity));

      assert.isFalse(isValid(actualForm.foo));

      assert.isFalse(isValid(actualForm), 'form should be invalid if any fields are invalid');
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
        actual.$form,
        {
          errors: {
            foo: false,
            baz: true,
          },
        });

      assert.isFalse(isValid(actual));
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
        actual.$form,
        {
          validity: {
            foo: 'truthy string',
            baz: null,
          },
          errors: {
            foo: false,
            baz: true,
          },
        });

      assert.isFalse(isValid(actual));

      actual = reducer(actual, actions.setValidity('test', {
        foo: false,
      }));

      assert.containSubset(
        actual.$form,
        {
          validity: {
            foo: false,
          },
          errors: {
            foo: true,
          },
        });

      assert.isFalse(isValid(actual));

      actual = reducer(actual, actions.setValidity('test', {
        foo: 'truthy string',
        baz: 100,
      }));

      assert.containSubset(
        actual.$form,
        {
          validity: {
            foo: 'truthy string',
            baz: 100,
          },
          errors: {
            foo: false,
            baz: false,
          },
        });

      assert.isTrue(isValid(actual));
    });

    it('should overwrite the previous validity', () => {
      const reducer = formReducer('test');

      const oldValidity = {
        existing: true,
      };

      const oldState = reducer(
        undefined,
        actions.setValidity('test', oldValidity));

      assert.deepEqual(
        oldState.$form.validity,
        oldValidity);

      const newValidity = {
        foo: true,
        bar: false,
      };

      const newState = reducer(
        oldState,
        actions.setValidity('test', newValidity));

      assert.deepEqual(
        newState.$form.validity,
        newValidity);

      assert.deepEqual(
        newState.$form.errors,
        {
          foo: false,
          bar: true,
        });
    });
  });

  describe('setErrors()', () => {
    it('should set the errors state of the field', () => {
      const reducer = formReducer('test');

      const actualInvalid = reducer(undefined, actions.setErrors('test.foo', true));

      assert.containSubset(
        actualInvalid.foo,
        {
          errors: true,
          validity: false,
        });

      assert.isFalse(isValid(actualInvalid.foo));

      const actualValid = reducer(undefined, actions.setErrors('test.foo', false));

      assert.containSubset(
        actualValid.foo,
        {
          errors: false,
          validity: true,
        });

      assert.isTrue(isValid(actualValid.foo));
    });

    it('should set the errors state of the field', () => {
      const reducer = formReducer('test');

      const errors = {
        good: true,
        bad: false,
      };

      const actual = reducer(undefined, actions.setErrors('test.foo', errors));

      assert.containSubset(
        actual.foo,
        {
          errors: {
            good: true,
            bad: false,
          },
          validity: {
            good: false,
            bad: true,
          },
        });

      assert.isFalse(isValid(actual.foo));
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
        actualForm.foo,
        {
          validity: {
            one: true,
            two: true,
            three: true,
          },
        });

      assert.isTrue(isValid(actualForm.foo));

      assert.isTrue(isValid(actualForm),
        'form should be valid if all fields are valid');
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
        actualForm.foo,
        {
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

      assert.isFalse(isValid(actualForm.foo));

      assert.isFalse(isValid(actualForm),
        'form should be invalid if any fields are invalid');
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
        actual.$form,
        {
          errors: {
            foo: true,
            baz: false,
          },
        });

      assert.isFalse(isValid(actual));
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
        actual.$form,
        {
          validity: {
            foo: false,
            baz: true,
          },
          errors: {
            foo: 'foo is required',
            baz: null,
          },
        });

      assert.isFalse(isValid(actual));

      actual = reducer(actual, actions.setErrors('test', {
        foo: false,
      }));

      assert.containSubset(
        actual.$form,
        {
          validity: {
            foo: true,
          },
          errors: {
            foo: false,
          },
        });

      assert.isTrue(isValid(actual));

      actual = reducer(actual, actions.setErrors('test', {
        foo: 'foo is required',
        baz: 'baz is also required',
      }));

      assert.containSubset(
        actual.$form,
        {
          validity: {
            foo: false,
            baz: false,
          },
          errors: {
            foo: 'foo is required',
            baz: 'baz is also required',
          },
        });

      assert.isFalse(isValid(actual));
    });

    it('should be able to set the errors to a string', () => {
      const reducer = formReducer('test');

      const errors = 'This whole thing is invalid';
      const fieldErrors = 'This field is invalid';

      let actual = reducer(
        undefined,
        actions.setErrors('test', errors));

      assert.containSubset(
        actual.$form,
        {
          errors,
          validity: false,
        });

      assert.isFalse(isValid(actual));

      actual = reducer(
        actual,
        actions.setErrors('test', false));

      assert.containSubset(
        actual.$form,
        {
          errors: false,
          validity: true,
        });

      assert.isTrue(isValid(actual));

      let actualField = reducer(
        undefined,
        actions.setErrors('test.foo', fieldErrors));

      assert.containSubset(
        actualField.foo,
        {
          errors: fieldErrors,
          validity: false,
        });

      assert.isFalse(isValid(actualField));

      actualField = reducer(
        actualField,
        actions.setErrors('test.foo', false));

      assert.containSubset(
        actualField.foo,
        {
          errors: false,
          validity: true,
        });

      assert.isTrue(isValid(actualField));
    });
  });

  describe('resetValidity() and resetErrors()', () => {
    const reducer = formReducer('test');

    it('should reset the validity and errors of a field state', () => {
      const stateWithErrors = reducer(
        undefined,
        actions.setErrors('test.foo', { bar: true, baz: true }));

      assert.containSubset(
        stateWithErrors.foo,
        {
          validity: { bar: false, baz: false },
          errors: { bar: true, baz: true },
        });

      assert.isFalse(isValid(stateWithErrors.foo));

      const actualState = reducer(
        stateWithErrors,
        actions.resetValidity('test.foo'));

      assert.containSubset(
        actualState.foo,
        {
          validity: {},
          errors: {},
        });

      assert.isTrue(isValid(actualState.foo));
    });

    it('should reset the validity and errors of a form', () => {
      const stateWithErrors = reducer(
        undefined,
        actions.setErrors('test.foo', { bar: true, baz: true }));

      const stateWithMoreErrors = reducer(
        stateWithErrors,
        actions.setErrors('test.bar', { foo: true, baz: true }));

      assert.containSubset(
        stateWithMoreErrors.foo,
        {
          validity: { bar: false, baz: false },
          errors: { bar: true, baz: true },
        });

      assert.isFalse(isValid(stateWithMoreErrors.foo));

      assert.containSubset(
        stateWithMoreErrors.bar,
        {
          validity: { foo: false, baz: false },
          errors: { foo: true, baz: true },
        });

      assert.isFalse(isValid(stateWithMoreErrors.bar));

      const actualState = reducer(
        stateWithMoreErrors,
        actions.resetValidity('test'));

      assert.deepEqual(actualState.foo.validity, {});
      assert.deepEqual(actualState.foo.errors, {});

      assert.isTrue(isValid(actualState));

      assert.containSubset(
        actualState.foo,
        {
          validity: {},
          errors: {},
        });

      assert.isTrue(isValid(actualState.foo));

      assert.containSubset(
        actualState.bar,
        {
          validity: {},
          errors: {},
        });

      assert.isTrue(isValid(actualState.bar));
    });

    it('should be aliased to resetErrors()', () => {
      const stateWithErrors = reducer(
        undefined,
        actions.setErrors('test.foo', { bar: true, baz: true }));

      const actualState = reducer(
        stateWithErrors,
        actions.resetErrors('test.foo'));

      assert.deepEqual(actualState.foo.validity, {});
      assert.deepEqual(actualState.foo.errors, {});

      assert.isTrue(isValid(actualState.foo));
    });
  });

  describe('asyncSetValidity() (thunk)', () => {
    it('should asynchronously call setValidity() action', (testDone) => {
      const reducer = formReducer('test');
      const dispatch = action => {
        if (action.type === actionTypes.SET_VALIDITY) {
          const actual = reducer(undefined, action);

          assert.isFalse(isValid(actual));

          assert.containSubset(
            actual.foo,
            {
              errors: {
                good: false,
                bad: true,
              },
            });

          testDone();
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
          const actual = reducer(undefined, action);

          assert.containSubset(
            actual.$form,
            {
              errors: {
                good: false,
                bad: true,
              },
            });

          assert.isFalse(isValid(actual));

          testDone();
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

    it('should set validating to true for a field when validating, and false when done validating',
      testDone => {
        const validatingStates = [];
        const executedActions = [];

        const reducer = formReducer('test');
        const dispatch = (action) => {
          executedActions.push(action);
          const state = reducer(undefined, action);

          if (action.type === actionTypes.SET_VALIDATING) {
            validatingStates.push(action.validating);

            assert.equal(state.foo.validating, action.validating);
          } else if (action.type === actionTypes.SET_VALIDITY) {
            validatingStates.push(state.foo.validating);

            testDone(assert.deepEqual(
              validatingStates,
              [true, false]));
          }
        };

        const getState = () => ({});

        const validator = (_, done) => done(true);

        actions.asyncSetValidity('test.foo', validator)(dispatch, getState);
      });

    it('should set validating to true for a form when validating, and false when done validating',
      testDone => {
        const validatingStates = [];
        const executedActions = [];

        const reducer = formReducer('test');
        const dispatch = (action) => {
          executedActions.push(action);
          const state = reducer(undefined, action);

          if (action.type === actionTypes.SET_VALIDATING) {
            validatingStates.push(action.validating);

            assert.equal(state.$form.validating, action.validating);
          } else if (action.type === actionTypes.SET_VALIDITY) {
            validatingStates.push(state.$form.validating);

            testDone(assert.deepEqual(
              validatingStates,
              [true, false]));
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
        {
          type: actionTypes.BATCH,
          model: 'test',
          actions: [
            { model: 'test', submitted: true, type: actionTypes.SET_SUBMITTED },
            { model: 'test', type: actionTypes.SET_VALIDITY, validity: true },
          ],
        },
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
        {
          type: actionTypes.BATCH,
          model: 'test',
          actions: [
            {
              type: actionTypes.SET_SUBMIT_FAILED,
              submitFailed: true,
              model: 'test',
            },
            { type: actionTypes.SET_ERRORS, errors, model: 'test' },
          ],
        },
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
            options: {},
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

      const validationOptions = {
        onValid: callback,
      };

      const store = mockStore(
        () => ({ test: { foo: 'bar' } }),
        [{
          model: 'test',
          type: actionTypes.SET_FIELDS_VALIDITY,
          fieldsValidity: {
            foo: true,
          },
          options: {},
        }],
        () => {
          assert.isTrue(callback.calledOnce);
          done();
        });

      const action = actions.validateFields('test', {
        foo: (val) => val === 'bar',
      }, validationOptions);

      store.dispatch(action);
    });

    it('should NOT call a callback if validation fails', (done) => {
      const callback = sinon.spy((val) => val);

      const validationOptions = {
        onValid: callback,
      };

      const store = mockStore(
        () => ({ test: { foo: 'bar' } }),
        [{
          model: 'test',
          type: actionTypes.SET_FIELDS_VALIDITY,
          fieldsValidity: {
            foo: false,
          },
          options: {},
        }],
        () => {
          assert.isTrue(callback.notCalled);
          done();
        });

      const action = actions.validateFields('test', {
        foo: (val) => val === 'invalid',
      }, validationOptions);

      store.dispatch(action);
    });
  });

  describe('validateFieldsErrors() (thunk)', () => {
    const mockStore = configureMockStore([thunk]);

    it('should set the errors of multiple fields in the same form', (done) => {
      const store = mockStore(
        () => ({ test: { foo: 'invalid' } }),
        [
          {
            fieldsValidity: {
              '': 'form is invalid',
              foo: 'foo is invalid',
              foo_invalid: 'foo_invalid is invalid',
              foo_valid: false,
              with_keys: {
                key_invalid: 'key_invalid is invalid',
                key_valid: false,
              },
            },
            model: 'test',
            type: actionTypes.SET_FIELDS_VALIDITY,
            options: {
              errors: true,
            },
          },
        ],
        done);

      const action = actions.validateFieldsErrors('test', {
        '': (val) => val.foo === 'invalid' && 'form is invalid',
        foo: (val) => val === 'invalid' && 'foo is invalid',
        foo_valid: () => false,
        foo_invalid: () => 'foo_invalid is invalid',
        with_keys: {
          key_valid: () => false,
          key_invalid: () => 'key_invalid is invalid',
        },
      });

      store.dispatch(action);
    });

    it('should call a callback if validation passes', (done) => {
      const callback = sinon.spy((val) => val);

      const validationOptions = {
        onValid: callback,
      };

      const store = mockStore(
        () => ({ test: { foo: 'valid' } }),
        [{
          model: 'test',
          type: actionTypes.SET_FIELDS_VALIDITY,
          fieldsValidity: {
            foo: false, // false = not an error
          },
          options: {
            errors: true,
          },
        }],
        () => {
          assert.isTrue(callback.calledOnce);
          done();
        });

      const action = actions.validateFieldsErrors('test', {
        foo: (val) => val === 'invalid',
      }, validationOptions);

      store.dispatch(action);
    });

    it('should NOT call a callback if validation fails', (done) => {
      const callback = sinon.spy((val) => val);

      const validationOptions = {
        onValid: callback,
      };

      const store = mockStore(
        () => ({ test: { foo: 'invalid' } }),
        [{
          model: 'test',
          type: actionTypes.SET_FIELDS_VALIDITY,
          fieldsValidity: {
            foo: true, // true = error
          },
          options: {
            errors: true,
          },
        }],
        () => {
          assert.isTrue(callback.notCalled);
          done();
        });

      const action = actions.validateFieldsErrors('test', {
        foo: (val) => val === 'invalid',
      }, validationOptions);

      store.dispatch(action);
    });
  });
});
