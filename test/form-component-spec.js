/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import { Form, createModelReducer, createFormReducer, Field } from '../src';

describe('<Form> component', () => {
  describe('validation on submit', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: createFormReducer('test'),
      test: createModelReducer('test'),
    }));

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Form model="test"
          validators={{
            foo: (val) => val === 'testing foo',
            bar: {
              one: (val) => val && val.length >= 1,
              two: (val) => val && val.length >= 2,
            },
          }}
        >
          <Field model="test.foo">
            <input type="text" />
          </Field>

          <Field model="test.bar">
            <input type="text" />
          </Field>
        </Form>
      </Provider>
    );

    const formElement = TestUtils.findRenderedDOMComponentWithTag(form, 'form');

    const [fooControl, barControl] = TestUtils.scryRenderedDOMComponentsWithTag(form, 'input');

    it('should validate all validators on submit', () => {
      TestUtils.Simulate.submit(formElement);

      assert.containSubset(
        store.getState().testForm.fields.foo,
        { valid: false });

      fooControl.value = 'testing foo';

      TestUtils.Simulate.change(fooControl);

      TestUtils.Simulate.submit(formElement);

      assert.containSubset(
        store.getState().testForm.fields.foo,
        { valid: true });
    });

    it('should allow for keywise validation', () => {
      TestUtils.Simulate.submit(formElement);

      assert.containSubset(
        store.getState().testForm.fields.bar,
        {
          errors: { one: true, two: true },
          valid: false,
        });

      barControl.value = '1';
      TestUtils.Simulate.change(barControl);
      TestUtils.Simulate.submit(formElement);

      assert.containSubset(
        store.getState().testForm.fields.bar,
        {
          errors: { one: false, two: true },
          valid: false,
        });

      barControl.value = '12';
      TestUtils.Simulate.change(barControl);
      TestUtils.Simulate.submit(formElement);

      assert.containSubset(
        store.getState().testForm.fields.bar,
        {
          errors: { one: false, two: false },
          valid: true,
        });
    });
  });

  describe('validation on change', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: createFormReducer('test'),
      test: createModelReducer('test', { bar: '' }),
    }));

    let fooValidationCalled = false;

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Form model="test"
          validators={{
            foo: (val) => val && val === 'testing foo',
            bar: {
              one: (val) => val && val.length >= 1,
              two: (val) => val && val.length >= 2,
              called: () => {
                fooValidationCalled = true;
                return true;
              },
            },
          }}
          validateOn="change"
        >
          <Field model="test.foo">
            <input type="text" />
          </Field>

          <Field model="test.bar">
            <input type="text" />
          </Field>
        </Form>
      </Provider>
    );

    const [fooControl] = TestUtils.scryRenderedDOMComponentsWithTag(form, 'input');

    it('should validate form validators on field change', () => {
      fooControl.value = 'invalid';

      TestUtils.Simulate.change(fooControl);

      assert.containSubset(
        store.getState().testForm.fields.foo,
        {
          errors: true,
          valid: false,
        });

      fooControl.value = 'testing foo';

      TestUtils.Simulate.change(fooControl);

      assert.containSubset(
        store.getState().testForm.fields.foo,
        {
          errors: false,
          valid: true,
        });
    });

    it('should NOT run validation for fields that have not changed', () => {
      fooControl.value = 'invalid';

      TestUtils.Simulate.change(fooControl);

      assert.isFalse(fooValidationCalled);
    });
  });

  describe('onSubmit() prop', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: createFormReducer('test'),
      test: createModelReducer('test'),
    }));

    let submitValue = null;

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Form model="test"
          validators={{
            foo: (val) => val && val === 'valid',
          }}
          onSubmit={(val) => (submitValue = val, true)}
        >
          <Field model="test.foo">
            <input type="text" />
          </Field>
        </Form>
      </Provider>
    );

    const formElement = TestUtils.findRenderedDOMComponentWithTag(form, 'form');

    const control = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

    it('should NOT call onSubmit if form is invalid', () => {
      TestUtils.Simulate.submit(formElement);

      assert.isNull(submitValue);
    });

    it('should call onSubmit with model value if form is valid', () => {
      control.value = 'valid';

      TestUtils.Simulate.change(control);

      TestUtils.Simulate.submit(formElement);

      assert.deepEqual(
        submitValue,
        { foo: 'valid' });
    });
  });

  describe('validation of form itself', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: createFormReducer('test'),
      test: createModelReducer('test'),
    }));

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Form model="test"
          validators={{
            '': {
              foobar: (val) => val.foo + val.bar === 'foobar',
            },
          }}
        >
          <Field model="test.foo">
            <input type="text" />
          </Field>
          <Field model="test.bar">
            <input type="text" />
          </Field>
        </Form>
      </Provider>
    );

    const formElement = TestUtils.findRenderedDOMComponentWithTag(form, 'form');

    const [fooControl, barControl] = TestUtils.scryRenderedDOMComponentsWithTag(form, 'input');

    it('should be able to set keyed validation to the form model', () => {
      TestUtils.Simulate.submit(formElement);

      assert.containSubset(
        store.getState().testForm,
        { valid: false });

      fooControl.value = 'foo';
      TestUtils.Simulate.change(fooControl);

      barControl.value = 'bar';
      TestUtils.Simulate.change(barControl);

      TestUtils.Simulate.submit(formElement);

      assert.containSubset(
        store.getState().testForm,
        { valid: true });
    });
  });
});
