import chai from 'chai';
import chaiSubset from 'chai-subset';
import should from 'should';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

chai.use(chaiSubset);

const { assert } = chai;

import { actions, createFormReducer, initialFieldState } from '../src';

describe('RSF field actions', () => {
  describe('focus()', () => {
    it('should set the focus state of the field to true and the blur state to false', () => {    
      const reducer = createFormReducer('test');

      assert.containSubset(
        reducer(initialFieldState, actions.focus('test.foo'))
          .field('foo'),
        {
          focus: true,
          blur: false
        });
    });
  });

  describe('blur()', () => {
    it('should set the blur state of the field to true and the focus state to false', () => {
      const reducer = createFormReducer('test');

      assert.containSubset(
        reducer(initialFieldState, actions.blur('test.foo'))
          .field('foo'),
        {
          blur: true,
          focus: false,
          touched: true,
          untouched: false
        });
    });
  });

  describe('setPristine()', () => {
    it('should set the pristine state of the field to true and the dirty state to false', () => {
      const reducer = createFormReducer('test');

      assert.containSubset(
        reducer(initialFieldState, actions.setPristine('test.foo'))
          .field('foo'),
        {
          pristine: true,
          dirty: false
        });
    });
  });

  describe('setDirty()', () => {
    it('should set the dirty state of the field to true and the pristine state to false', () => {
      const reducer = createFormReducer('test');

      assert.containSubset(
        reducer(initialFieldState, actions.setDirty('test.foo'))
          .field('foo'),
        {
          dirty: true,
          pristine: false
        });
    });
  });

  describe('setPending()', () => {
    it('should set the pending state of the field to true and the submitted state to false', () => {
      const reducer = createFormReducer('test');

      assert.containSubset(
        reducer(initialFieldState, actions.setPending('test.foo'))
          .field('foo'),
        {
          pending: true,
          submitted: false
        });
    });
  });

  describe('setSubmitted()', () => {
    it('should set the submitted state of the field to true and the pending state to false', () => {
      const reducer = createFormReducer('test');

      assert.containSubset(
        reducer(initialFieldState, actions.setSubmitted('test.foo'))
          .field('foo'),
        {
          submitted: true,
          pending: false
        });
    });
  });

  describe('setTouched()', () => {
    it('should set the touched and blurred state of the field to true and the untouched and focused state to false', () => {
      const reducer = createFormReducer('test');

      assert.containSubset(
        reducer(initialFieldState, actions.setTouched('test.foo'))
          .field('foo'),
        {
          touched: true,
          untouched: false,
          focus: false,
          blur: true
        });
    });
  });

  describe('setUntouched()', () => {
    it('should set the untouched state of the field to true and the touched state to false', () => {
      const reducer = createFormReducer('test');

      assert.containSubset(
        reducer(initialFieldState, actions.setUntouched('test.foo'))
          .field('foo'),
        {
          untouched: true,
          touched: false
        });
    });
  });

  describe('setValidity()', () => {
    it('should set the errors state of the field the inverse of a boolean validity', () => {
      const reducer = createFormReducer('test');

      assert.containSubset(
        reducer(initialFieldState, actions.setValidity('test.foo', true))
          .field('foo'),
        {
          errors: false
        });

      assert.containSubset(
        reducer(initialFieldState, actions.setValidity('test.foo', false))
          .field('foo'),
        {
          errors: true
        });
    });

    it('should set the errors state of the field the inverse of each value of a validity object', () => {
      const reducer = createFormReducer('test');

      let validity = {
        good: true,
        bad: false
      }

      assert.containSubset(
        reducer(initialFieldState, actions.setValidity('test.foo', validity))
          .field('foo'),
        {
          errors: {
            good: false,
            bad: true
          }
        });
    });

    it('should set the valid state to true if all values in validity object are true', () => {
      const reducer = createFormReducer('test');

      let validity = {
        one: true,
        two: true
      };

      assert.containSubset(
        reducer(initialFieldState, actions.setValidity('test.foo', validity))
          .field('foo'),
        {
          valid: true
        });
    });

    it('should set the valid state to false if any value in validity object are false', () => {
      const reducer = createFormReducer('test');

      let validity = {
        one: true,
        two: true,
        three: false
      };

      assert.containSubset(
        reducer(initialFieldState, actions.setValidity('test.foo', validity))
          .field('foo'),
        {
          valid: false
        });
    });
  });

  describe('asyncSetValidity() (thunk)', () => {
    it('should asynchronously call setValidity() action', (testDone) => {
      const reducer = createFormReducer('test');
      const dispatch = (action) => {
        if (action.type === 'rsf/setValidity') {        
          testDone(assert.containSubset(
            reducer(initialFieldState, action)
              .field('foo'),
              {
              valid: false,
              errors: {
                good: false,
                bad: true
              }
            }));
        }
      };

      const getState = () => ({
        test: { foo: 5 }
      });

      let validator = (value, done) => done({
        good: value > 4,
        bad: value > 5
      });

      actions.asyncSetValidity('test.foo', validator)(dispatch, getState);
    });

    it('should set pending to false when validating, and true when done validating', (testDone) => {
      let pendingStates = [];

      const reducer = createFormReducer('test');
      const dispatch = (action) => {
        if (action.type === 'rsf/setPending') {
          pendingStates.push(action.pending);
          
          if (action.pending === false) { 
            testDone(assert.deepEqual(
              pendingStates,
              [true, false]));
          }
        }
      };

      const getState = () => ({});

      let validator = (_, done) => done(true);

      actions.asyncSetValidity('test.foo', validator)(dispatch, getState);
    });
  });
});
