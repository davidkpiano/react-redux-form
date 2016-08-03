import { assert } from 'chai';
import { formReducer, actions, form } from '../src';

describe('selectors', () => {
  describe('form() selector', () => {
    it('should contain the actual form state as a subset', () => {
      const reducer = formReducer('test', { foo: 'bar' });

      const actual = reducer(undefined, { type: null });

      assert.containSubset(form(actual), actual);
    });

    it('should get the valid state of the form', () => {
      const reducer = formReducer('test', { foo: 'bar' });
      const invalidForm = reducer(undefined,
        actions.setValidity('test.foo', false));
      const validForm = reducer(undefined,
        actions.setValidity('test.foo', true));

      assert.isFalse(form(invalidForm).valid);
      assert.isTrue(form(validForm).valid);
    });

    it('should get the pending state of the form', () => {
      const reducer = formReducer('test', { foo: 'bar' });
      const notPendingForm = reducer(undefined,
        actions.setPending('test.foo', false));
      const pendingForm = reducer(undefined,
        actions.setPending('test.foo', true));

      assert.isFalse(form(notPendingForm).pending);
      assert.isTrue(form(pendingForm).pending);
    });

    it('should get the retouched state of the form', () => {
      const reducer = formReducer('test', { foo: 'bar' });
      const untouchedForm = reducer(undefined,
        actions.setUntouched('test.foo'));
      const touchedForm = reducer(undefined,
        actions.setTouched('test.foo'));

      assert.isFalse(form(untouchedForm).touched);
      assert.isTrue(form(touchedForm).touched);
    });

    it('should get the retouched state of the form', () => {
      const reducer = formReducer('test', { foo: 'bar' });
      const nonRetouchedForm = reducer(undefined,
        { type: null });
      const submittedForm = reducer(nonRetouchedForm,
        actions.setSubmitted('test'));
      const retouchedForm = reducer(submittedForm,
        actions.setTouched('test.foo'));

      assert.isFalse(form(nonRetouchedForm).retouched);
      assert.isFalse(form(submittedForm).retouched);
      assert.isTrue(form(retouchedForm).retouched);
    });
  });
});
