/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import { assert } from 'chai';
import React from 'react';
import { findDOMNode } from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import createTestStore from 'redux-test-store';
import sinon from 'sinon';

import isValid from '../src/form/is-valid';
import { defaultTestContexts, testCreateStore, testRender } from './utils';

import {
  Form as _Form,
  modelReducer as _modelReducer,
  formReducer as _formReducer,
  Field as _Field,
  Control as _Control,
  actions as _actions,
  actionTypes,
  combineForms as _combineForms,
} from '../src';
import {
  Form as ImmutableForm,
  modelReducer as immutableModelReducer,
  formReducer as immutableFormReducer,
  Field as ImmutableField,
  Control as ImmutableControl,
  actions as immutableActions,
  combineForms as immutableCombineForms,
} from '../immutable';

const testContexts = {
  standard: {
    ...defaultTestContexts.standard,
    Form: _Form,
    modelReducer: _modelReducer,
    formReducer: _formReducer,
    Field: _Field,
    Control: _Control,
    actions: _actions,
    combineForms: _combineForms,
  },
  immutable: {
    ...defaultTestContexts.immutable,
    Form: ImmutableForm,
    modelReducer: immutableModelReducer,
    formReducer: immutableFormReducer,
    Field: ImmutableField,
    Control: ImmutableControl,
    actions: immutableActions,
    combineForms: immutableCombineForms,
  },
};

Object.keys(testContexts).forEach((testKey) => {
  const testContext = testContexts[testKey];
  const Form = testContext.Form;
  const modelReducer = testContext.modelReducer;
  const formReducer = testContext.formReducer;
  const Field = testContext.Field;
  const Control = testContext.Control;
  const actions = testContext.actions;
  const object = testContext.object;
  const get = testContext.get;
  const getInitialState = testContext.getInitialState;
  const combineForms = testContext.combineForms;

  describe(`<Form> component (${testKey} context)`, () => {
    describe('wraps component if specified', () => {
      const store = testCreateStore({
        testForm: formReducer('test', object),
        test: modelReducer('test'),
      });

      it('should wrap children with specified component (string)', () => {
        const form = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Form model="test" component="section" />
          </Provider>
        );

        const wrapper = TestUtils.findRenderedDOMComponentWithTag(form, 'section');

        assert.ok(wrapper);
      });

      it('should wrap children with specified component (class)', () => {
        class Wrapper extends React.Component {
          render() {
            const { children, ...other } = this.props;
            return <form className="wrapper" {...other}>{children}</form>;
          }
        }
        Wrapper.propTypes = {
          children: React.PropTypes.object,
        };
        const form = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Form model="test" component={Wrapper} />
          </Provider>
        );

        const wrapper = TestUtils.findRenderedDOMComponentWithClass(form, 'wrapper');

        assert.ok(wrapper);
      });
      it('Renders as <form> by default', () => {
        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Form model="test" />
          </Provider>
        );

        const wrapper = TestUtils.findRenderedDOMComponentWithTag(field, 'form');

        assert.ok(wrapper);
      });
    });

    describe('validation on submit', () => {
      function fixture() {
        const initialState = getInitialState({ foo: '', bar: '' });
        const store = testCreateStore({
          testForm: formReducer('test', initialState),
          test: modelReducer('test', initialState),
        });

        let timesValidated = 0;

        function getTimesValidated() {
          return timesValidated;
        }

        const form = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Form
              model="test"
              validators={{
                foo: (val) => {
                  timesValidated += 1;
                  return val === 'testing foo';
                },
                bar: {
                  one: (val) => val && val.length >= 1,
                  two: (val) => val && val.length >= 2,
                },
              }}
              validateOn="submit"
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

        return {
          store,
          form,
          formElement,
          fooControl,
          barControl,
          timesValidated: getTimesValidated,
        };
      }

      it('should not validate before submit', () => {
        const { timesValidated } = fixture();

        assert.equal(timesValidated(), 0);
      });

      it('should not validate on change', () => {
        const { fooControl, timesValidated } = fixture();

        TestUtils.Simulate.change(fooControl);

        assert.equal(timesValidated(), 0);
      });

      it('should validate all validators on submit', () => {
        const {
          formElement,
          store,
          timesValidated,
          fooControl,
        } = fixture();

        assert.equal(timesValidated(), 0);

        TestUtils.Simulate.submit(formElement);

        assert.equal(timesValidated(), 1);

        assert.isFalse(store.getState().testForm.foo.valid);

        fooControl.value = 'testing foo';

        TestUtils.Simulate.change(fooControl);

        assert.equal(
          get(store.getState().test, 'foo'),
          'testing foo');

        assert.equal(timesValidated(), 1,
          'should not have validated again before submit');

        TestUtils.Simulate.submit(formElement);

        assert.equal(timesValidated(), 2);

        assert.isTrue(store.getState().testForm.foo.valid);
      });

      it('should allow for keywise validation', () => {
        const { formElement, store, barControl } = fixture();

        TestUtils.Simulate.submit(formElement);

        assert.containSubset(
          store.getState().testForm.bar,
          {
            errors: { one: true, two: true },
          });

        assert.isFalse(store.getState().testForm.bar.valid);

        barControl.value = '1';
        TestUtils.Simulate.change(barControl);

        assert.equal(
          get(store.getState().test, 'bar'),
          '1');

        TestUtils.Simulate.submit(formElement);

        assert.containSubset(
          store.getState().testForm.bar,
          {
            errors: { one: false, two: true },
          });

        assert.isFalse(store.getState().testForm.bar.valid);

        barControl.value = '12';
        TestUtils.Simulate.change(barControl);

        assert.equal(
          get(store.getState().test, 'bar'),
          '12');

        TestUtils.Simulate.submit(formElement);

        assert.containSubset(
          store.getState().testForm.bar,
          {
            errors: { one: false, two: false },
          });

        assert.isTrue(store.getState().testForm.bar.valid);
      });
    });

    describe('error validation on submit', () => {
      const initialState = getInitialState({
        foo: '',
        bar: '',
      });
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', initialState),
      });

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            errors={{
              foo: (val) => val !== 'valid foo' && 'invalid foo',
              bar: {
                one: (val) => val.length < 1 && 'bar too short',
                two: (val) => val.length > 2 && 'bar too long',
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
          store.getState().testForm.foo,
          {
            errors: 'invalid foo',
          });

        assert.isFalse(store.getState().testForm.foo.valid);

        fooControl.value = 'valid foo';

        TestUtils.Simulate.change(fooControl);

        TestUtils.Simulate.submit(formElement);

        assert.containSubset(
          store.getState().testForm.foo,
          {
            errors: false,
          });

        assert.isTrue(store.getState().testForm.foo.valid);
      });

      it('should allow for keywise validation', () => {
        TestUtils.Simulate.submit(formElement);

        assert.containSubset(
          store.getState().testForm.bar,
          {
            errors: {
              one: 'bar too short',
              two: false,
            },
          });

        assert.isFalse(store.getState().testForm.bar.valid);

        barControl.value = '1';
        TestUtils.Simulate.change(barControl);
        TestUtils.Simulate.submit(formElement);

        assert.containSubset(
          store.getState().testForm.bar,
          {
            errors: {
              one: false,
              two: false,
            },
          });

        assert.isTrue(store.getState().testForm.bar.valid);

        barControl.value = '12';
        TestUtils.Simulate.change(barControl);
        TestUtils.Simulate.submit(formElement);

        assert.containSubset(
          store.getState().testForm.bar,
          {
            errors: {
              one: false,
              two: false,
            },
          });

        assert.isTrue(store.getState().testForm.bar.valid);

        barControl.value = '123';
        TestUtils.Simulate.change(barControl);
        TestUtils.Simulate.submit(formElement);

        assert.containSubset(
          store.getState().testForm.bar,
          {
            errors: {
              one: false,
              two: 'bar too long',
            },
          });

        assert.isFalse(store.getState().testForm.bar.valid);
      });
    });

    describe('submit validation with blur update fields', () => {
      const initialState = getInitialState({
        foo: '',
        bar: '',
      });
      const store = testCreateStore({
        testForm: formReducer('test', initialState),
        test: modelReducer('test', initialState),
      });

      const required = (v) => !!(v && v.length);

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            validators={{
              foo: required,
              bar: required,
            }}
            validateOn="submit"
          >
            <Field model="test.foo" updateOn="blur">
              <input type="text" />
            </Field>

            <Field model="test.bar" updateOn="blur">
              <input type="text" />
            </Field>
          </Form>
        </Provider>
      );

      const inputs = TestUtils.scryRenderedDOMComponentsWithTag(form, 'input');
      const formNode = TestUtils.findRenderedDOMComponentWithTag(form, 'form');

      it('fields should not be validated initially', () => {
        assert.ok(store.getState().testForm.foo.valid);
        assert.ok(store.getState().testForm.bar.valid);
      });

      it('fields should not be validated after change', () => {
        TestUtils.Simulate.change(inputs[0]);
        TestUtils.Simulate.change(inputs[1]);

        assert.ok(store.getState().testForm.foo.valid);
        assert.ok(store.getState().testForm.bar.valid);
      });

      it('fields should be validated after submit', () => {
        TestUtils.Simulate.submit(formNode);

        assert.isFalse(store.getState().testForm.foo.valid);
        assert.isFalse(store.getState().testForm.bar.valid);
      });

      it('fields should be validated with current values after submit', () => {
        TestUtils.Simulate.submit(formNode);

        // Not valid yet
        assert.isFalse(store.getState().testForm.foo.valid);
        assert.isFalse(store.getState().testForm.bar.valid);

        inputs[0].value = 'first';
        inputs[1].value = 'second';

        TestUtils.Simulate.change(inputs[0]);
        TestUtils.Simulate.change(inputs[1]);

        TestUtils.Simulate.submit(formNode);

        // Still not valid yet
        assert.isFalse(store.getState().testForm.foo.valid);
        assert.isFalse(store.getState().testForm.bar.valid);

        // Change model
        TestUtils.Simulate.blur(inputs[0]);
        TestUtils.Simulate.blur(inputs[1]);

        TestUtils.Simulate.submit(formNode);

        // Should be valid
        assert.ok(store.getState().testForm.foo.valid);
        assert.ok(store.getState().testForm.bar.valid);
      });
    });

    describe('error validation from silent changes on submit', () => {
      const initialState = getInitialState({
        foo: 'valid foo',
        bar: '',
      });
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', initialState),
      });

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            errors={{
              foo: (val) => val !== 'valid foo' && 'invalid foo',
              bar: {
                one: (val) => val.length < 1 && 'bar too short',
                two: (val) => val.length > 2 && 'bar too long',
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

      it('should show correct initial error messages', () => {
        assert.deepEqual(
          store.getState().testForm.bar.errors,
          {
            one: 'bar too short',
            two: false,
          });
      });

      it('should validate errors upon submit after silent changes', () => {
        store.dispatch(actions.load('test.foo', 'nope'));

        TestUtils.Simulate.submit(formElement);

        assert.equal(
          store.getState().testForm.foo.errors,
          'invalid foo');
      });
    });

    describe('validation on change (default)', () => {
      const initialState = getInitialState({
        foo: '',
        bar: '',
      });
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', initialState),
      });

      let timesBarValidationCalled = 0;

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            validators={{
              foo: (val) => val && val === 'testing foo',
              bar: {
                one: (val) => val && val.length >= 1,
                two: (val) => val && val.length >= 2,
                called: () => {
                  timesBarValidationCalled += 1;
                  return true;
                },
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

      const [fooControl] = TestUtils.scryRenderedDOMComponentsWithTag(form, 'input');

      it('should validate form validators initially on load', () => {
        assert.equal(timesBarValidationCalled, 1);
      });

      it('should validate form validators on field change', () => {
        fooControl.value = 'invalid';

        TestUtils.Simulate.change(fooControl);

        assert.containSubset(
          store.getState().testForm.foo,
          {
            errors: true,
          });

        assert.isFalse(store.getState().testForm.foo.valid);

        fooControl.value = 'testing foo';

        TestUtils.Simulate.change(fooControl);

        assert.containSubset(
          store.getState().testForm.foo,
          {
            errors: false,
          });

        assert.isTrue(store.getState().testForm.foo.valid);
      });

      it('should NOT run validation for fields that have not changed', () => {
        fooControl.value = 'invalid';

        TestUtils.Simulate.change(fooControl);

        assert.equal(timesBarValidationCalled, 1);
      });
    });

    describe('error validation on change', () => {
      const initialState = getInitialState({
        foo: '',
        bar: '',
      });
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', initialState),
      });

      let timesBarValidationCalled = 0;

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            errors={{
              foo: (val) => val !== 'valid foo' && 'invalid foo',
              bar: () => {
                timesBarValidationCalled += 1;
                return 'bar validated';
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

      it('should validate form validators initially on load', () => {
        assert.equal(timesBarValidationCalled, 1);
      });

      it('should validate form error validators on field change', () => {
        fooControl.value = 'invalid';

        TestUtils.Simulate.change(fooControl);

        assert.containSubset(
          store.getState().testForm.foo,
          {
            errors: 'invalid foo',
          });

        assert.isFalse(store.getState().testForm.foo.valid);

        fooControl.value = 'valid foo';

        TestUtils.Simulate.change(fooControl);

        assert.containSubset(
          store.getState().testForm.foo,
          {
            errors: false,
          });

        assert.isTrue(store.getState().testForm.foo.valid);
      });

      it('should NOT run validation for fields that have not changed', () => {
        fooControl.value = 'testing';

        TestUtils.Simulate.change(fooControl);

        assert.equal(timesBarValidationCalled, 1);
      });
    });

    describe('maintaining field validation state', () => {
      const initialState = getInitialState({
        foo: '',
        bar: '',
      });

      const required = (val) => val && val.length;

      const store = testCreateStore({
        testForm: formReducer('test', initialState),
        test: modelReducer('test', initialState),
      });

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            validators={{
              foo: required,
              bar: required,
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

      const [fooControl, barControl] = TestUtils.scryRenderedDOMComponentsWithTag(form, 'input');

      it('should initially be invalid', () => {
        assert.isFalse(store.getState().testForm.$form.valid);
      });

      it('should still be invalid if fields are still invalid', () => {
        fooControl.value = 'valid';
        TestUtils.Simulate.change(fooControl);

        assert.isTrue(
          store.getState().testForm.foo.valid,
          'foo should be valid');
        assert.isFalse(
          store.getState().testForm.bar.valid,
          'bar should be invalid');

        assert.isFalse(
          store.getState().testForm.$form.valid,
          'form should be invalid');
      });

      it('should be valid once all fields are valid', () => {
        fooControl.value = 'valid';
        TestUtils.Simulate.change(fooControl);
        barControl.value = 'valid';
        TestUtils.Simulate.change(barControl);

        assert.isTrue(
          store.getState().testForm.foo.valid,
          'foo should be valid');
        assert.isTrue(
          store.getState().testForm.bar.valid,
          'bar should be valid');

        assert.isTrue(
          store.getState().testForm.$form.valid,
          'form should be valid');
      });
    });

    describe('onSubmit() prop', () => {
      const initialState = getInitialState({
        foo: '',
        bar: '',
        baz: '',
      });
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', initialState),
      });

      let submitValue = null;

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            validators={{
              foo: (val) => val && val === 'valid',
              baz: {
                validationKey: (val) => val && val === 'valid',
              },
            }}
            errors={{
              bar: (val) => val !== 'bar' && 'bar invalid',
            }}
            onSubmit={(val) => {
              submitValue = val;
              return true;
            }}
          >
            <Field model="test.foo">
              <input type="text" />
            </Field>

            <Field model="test.bar">
              <input type="text" />
            </Field>

            <Field model="test.baz">
              <input type="text" />
            </Field>
          </Form>
        </Provider>
      );

      const formElement = TestUtils.findRenderedDOMComponentWithTag(form, 'form');

      const [fooControl, barControl, bazControl] = TestUtils
        .scryRenderedDOMComponentsWithTag(form, 'input');

      it('should NOT call onSubmit if form is invalid', () => {
        TestUtils.Simulate.submit(formElement);

        assert.isNull(submitValue);

        fooControl.value = 'valid';

        TestUtils.Simulate.change(fooControl);

        assert.isTrue(
          store.getState().testForm.foo.valid);

        assert.isNull(submitValue);
      });

      it('should set submitFailed to true if form is invalid and submitted', () => {
        TestUtils.Simulate.submit(formElement);

        assert.isTrue(store.getState().testForm.$form.submitFailed);
      });

      it('should call onSubmit with model value if form is valid', () => {
        barControl.value = 'bar';

        TestUtils.Simulate.change(barControl);

        TestUtils.Simulate.submit(formElement);

        assert.isNull(submitValue,
          'should not be valid yet because baz is still invalid');

        bazControl.value = 'valid';

        TestUtils.Simulate.change(bazControl);

        assert.deepEqual(
          get(store.getState().test),
          {
            foo: 'valid',
            bar: 'bar',
            baz: 'valid',
          });

        TestUtils.Simulate.submit(formElement);

        assert.deepEqual(
          get(submitValue),
          {
            bar: 'bar',
            baz: 'valid',
            foo: 'valid',
          });
      });
    });

    describe('onSubmit() mixing form and field validation', () => {
      it('should NOT call onSubmit if any form subfield is invalid', () => {
        const initialState = getInitialState({
          foo: '',
        });
        const store = testCreateStore({
          testForm: formReducer('test'),
          test: modelReducer('test', initialState),
        });

        let submitValue = null;

        const form = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Form
              model="test"
              validators={{
                '': () => true,
              }}
              onSubmit={(val) => {
                submitValue = val;
                return true;
              }}
            >
              <Field
                model="test.foo"
                validators={{ fieldLevel: () => false }}
              >
                <input type="text" />
              </Field>
            </Form>
          </Provider>
        );

        const formElement = TestUtils.findRenderedDOMComponentWithTag(form, 'form');

        TestUtils.Simulate.submit(formElement);

        assert.isNull(submitValue);

        assert.isFalse(store.getState().testForm.$form.submitted);
      });
    });

    describe('validation of form itself', () => {
      const initialState = getInitialState({
        foo: '',
        bar: '',
      });
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', initialState),
      });

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            validators={{
              '': {
                foobar: (val) => get(val, 'foo') + get(val, 'bar') === 'foobar',
              },
            }}
            errors={{
              '': {
                formError: (val) => get(val, 'foo') === 'error' && 'form error',
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

        assert.isFalse(store.getState().testForm.$form.valid);

        fooControl.value = 'foo';
        TestUtils.Simulate.change(fooControl);

        barControl.value = 'bar';
        TestUtils.Simulate.change(barControl);

        TestUtils.Simulate.submit(formElement);

        assert.isTrue(store.getState().testForm.$form.valid);
      });

      it('should be able to set keyed errors to the form model', () => {
        fooControl.value = 'error';

        TestUtils.Simulate.change(fooControl);
        TestUtils.Simulate.submit(formElement);

        assert.containSubset(
          store.getState().testForm.$form,
          {
            errors: {
              foobar: true,
              formError: 'form error',
            },
          });

        assert.isFalse(store.getState().testForm.$form.valid);
      });
    });

    describe('external validators', () => {
      const initialState = getInitialState({
        foo: '',
        bar: '',
      });
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', initialState),
      });

      let timesSubmitCalled = 0;

      function handleSubmit() {
        timesSubmitCalled++;
      }

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            onSubmit={handleSubmit}
          >
            <Field
              model="test.foo"
              validators={{
                required: (val) => val && val.length > 5,
              }}
            >
              <input type="text" />
            </Field>
          </Form>
        </Provider>
      );

      const formElement = TestUtils.findRenderedDOMComponentWithTag(form, 'form');
      const inputElement = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

      it('should initially be invalid if the form state is invalid', () => {
        TestUtils.Simulate.submit(formElement);

        assert.equal(timesSubmitCalled, 0);
      });

      it('should prevent onSubmit if the form state is invalid after change', () => {
        inputElement.value = 'short';

        TestUtils.Simulate.change(inputElement);
        TestUtils.Simulate.submit(formElement);

        assert.equal(timesSubmitCalled, 0);
      });

      it('should submit once the form state is valid after change', () => {
        inputElement.value = 'longer';

        TestUtils.Simulate.change(inputElement);
        TestUtils.Simulate.submit(formElement);

        assert.equal(timesSubmitCalled, 1);
      });
    });

    describe('deep state path', () => {
      const initialState = getInitialState({
        foo: 'deep foo',
      });
      const formsReducer = combineReducers({
        testForm: formReducer('forms.test'),
        test: modelReducer('forms.test', initialState),
      });
      const store = testCreateStore({
        forms: formsReducer,
      });

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="forms.test"
          >
            <Control model=".foo" />
          </Form>
        </Provider>
      );

      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

      it('should resolve the model value', () => {
        assert.equal(input.value, 'deep foo');
      });
    });

    describe('invalidating async validity on form change', () => {
      const initialState = getInitialState({ val: 'invalid' });
      const store = createTestStore(testCreateStore({
        test: modelReducer('test', initialState),
        testForm: formReducer('test', initialState),
      }));

      function handleSubmit() {
        const promise = new Promise((resolve, reject) => reject('Form is invalid'));

        store.dispatch(actions.submit('test', promise));
      }

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            onSubmit={handleSubmit}
          >
            <Field model="test.foo">
              <input type="text" />
            </Field>
          </Form>
        </Provider>
      );

      const formElement = TestUtils.findRenderedDOMComponentWithTag(form, 'form');
      const inputElement = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

      it('should set errors from rejected submit handler on valid submit', (done) => {
        store.when(actionTypes.SET_ERRORS, (state) => {
          assert.isFalse(isValid(state.testForm));
          assert.equal(state.testForm.$form.errors, 'Form is invalid');
          done();
        });

        TestUtils.Simulate.submit(formElement);
      });

      it('should set validity on form changes after submit failed', () => {
        inputElement.value = 'valid';
        TestUtils.Simulate.change(inputElement);

        assert.isTrue(store.getState().testForm.$form.valid);
      });
    });

    describe('invalidating async validity on form change with form validators', () => {
      const initialState = getInitialState({ foo: 'invalid' });
      const store = createTestStore(testCreateStore({
        test: modelReducer('test', initialState),
        testForm: formReducer('test', initialState),
      }));

      function handleSubmit() {
        store.dispatch(actions.batch('test', [
          actions.setSubmitFailed('test'),
          actions.setErrors('test', 'Form is invalid', { errors: true }),
        ]));
      }

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            validators={{
              foo: (val) => val && val.length,
            }}
            onSubmit={handleSubmit}
          >
            <Field model="test.foo">
              <input type="text" />
            </Field>
          </Form>
        </Provider>
      );

      const formElement = TestUtils.findRenderedDOMComponentWithTag(form, 'form');
      const inputElement = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

      it('should set errors from rejected submit handler on valid submit', () => {
        assert.isTrue(store.getState().testForm.$form.valid);

        TestUtils.Simulate.submit(formElement);

        assert.containSubset(
          store.getState().testForm.$form,
          { errors: 'Form is invalid' });
      });

      it('should set validity on form changes after submit failed', () => {
        inputElement.value = 'valid';
        TestUtils.Simulate.change(inputElement);

        assert.isTrue(store.getState().testForm.$form.valid);
      });
    });

    describe('submit after fields valid but form invalid', () => {
      const handleSubmit = sinon.spy((val) => val);

      const initialState = getInitialState({
        pass1: '',
        pass2: '',
      });
      const store = createTestStore(testCreateStore({
        test: modelReducer('test', initialState),
        testForm: formReducer('test', initialState),
      }));

      const passwordsMatch = (val) => get(val, 'pass1') === get(val, 'pass2');
      const required = (val) => val && val.length;

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            validators={{
              '': [passwordsMatch],
              pass1: [required],
              pass2: [required],
            }}
            onSubmit={handleSubmit}
            validateOn="submit"
          >
            <Field model="test.pass1">
              <input />
            </Field>
            <Field model="test.pass2">
              <input />
            </Field>
          </Form>
        </Provider>
      );

      const formElement = TestUtils.findRenderedDOMComponentWithTag(form, 'form');
      const [pass1, pass2] = TestUtils.scryRenderedDOMComponentsWithTag(form, 'input');

      it('should fail to submit with valid fields but an invalid form', () => {
        TestUtils.Simulate.submit(formElement);

        assert.isFalse(store.getState().testForm.$form.valid);
        assert.isTrue(store.getState().testForm.$form.submitFailed);

        pass1.value = 'aaa';
        pass2.value = 'bbb';

        TestUtils.Simulate.change(pass1);
        TestUtils.Simulate.change(pass2);

        TestUtils.Simulate.submit(formElement);

        assert.isTrue(handleSubmit.callCount === 0);

        assert.isTrue(store.getState().testForm.$form.submitFailed);
        assert.isFalse(store.getState().testForm.$form.valid);
      });

      it('should submit with valid fields and a valid form', () => {
        pass2.value = 'aaa';

        TestUtils.Simulate.change(pass2);

        TestUtils.Simulate.submit(formElement);

        assert.isTrue(store.getState().testForm.$form.valid);

        assert.isTrue(handleSubmit.calledOnce);

        assert.isFalse(store.getState().testForm.$form.submitFailed);

        assert.ok(store.getState().testForm.$form.valid);
      });
    });

    describe('form revalidation after manual validation', () => {
      const initialState = getInitialState({ foo: 'bar' });
      const store = testCreateStore({
        login: modelReducer('login', initialState),
        loginForm: formReducer('login', initialState),
      });
      const handleSubmit = (values) => {
        if (get(values, 'foo') !== 'changed') {
          store.dispatch(actions.setValidity('login', {
            correctDetails: false,
          }));
        }
      };
      const form = testRender(
        <Form model="login" onSubmit={handleSubmit}>
          <Field model="login.foo">
            <input />
          </Field>
        </Form>, store);

      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');
      const formNode = TestUtils.findRenderedDOMComponentWithTag(form, 'form');

      it('should revalidate after being set invalid', () => {
        TestUtils.Simulate.submit(formNode);

        assert.isFalse(store.getState().loginForm.$form.valid);

        input.value = 'changed';

        TestUtils.Simulate.change(input);

        TestUtils.Simulate.submit(formNode);

        assert.isTrue(store.getState().loginForm.$form.valid);
      });
    });

    describe('form reducer name isolation', () => {
      const store = testCreateStore({
        user: modelReducer('user'),
        userForm: formReducer('user'),
        userEx: modelReducer('userEx'),
        userExForm: formReducer('userEx'),
      });

      const isRequired = (val) => val && val.length;

      class UserForm extends React.Component {
        componentDidMount() {
          store.dispatch(actions.change('userEx', { username: '', email: '' }));
        }

        render() {
          return (
            <Form
              model="userEx"
              validators={{
                username: isRequired,
                email: isRequired,
              }}
            >
              <Field model="userEx.username">
                <input type="text" />
              </Field>

              <Field model="userEx.email">
                <input type="text" />
              </Field>
            </Form>
          );
        }
      }

      TestUtils.renderIntoDocument(
        <Provider store={store}>
          <UserForm />
        </Provider>
      );

      it('the similarly-named userEx form should not be valid in presence of'
        + 'valid user form', () => {
        assert.isFalse(store.getState().userExForm.$form.valid);
      });
    });

    describe('field validation and external changes', () => {
      const initialState = getInitialState({
        foo: '',
        bar: '',
      });
      const store = testCreateStore({
        test: modelReducer('test', initialState),
        testForm: formReducer('test', initialState),
      });

      it('should validate form on external (async) change', () => {
        const required = (val) => val && val.length;

        TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Form model="test">
              <Field
                model="test.foo"
                validators={{ required }}
              >
                <input type="text" />
              </Field>
              <Field
                model="test.bar"
                validators={{ required }}
              >
                <input type="text" />
              </Field>
            </Form>
          </Provider>
        );

        assert.isFalse(store.getState().testForm.$form.valid);

        store.dispatch(actions.change('test', {
          foo: 'foo valid',
          bar: 'bar valid',
        }));

        assert.isTrue(store.getState().testForm.$form.valid);
      });
    });

    xdescribe('reset event on form', () => {
      it('should reset the model on the onReset event', () => {
        const initialState = getInitialState({ foo: '' });
        const store = testCreateStore({
          test: modelReducer('test', initialState),
          testForm: formReducer('test', initialState),
        });

        const form = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Form model="test">
              <Field model="test.foo">
                <input type="text" />
              </Field>
              <button type="reset" />
            </Form>
          </Provider>
        );

        const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');
        const reset = TestUtils.findRenderedDOMComponentWithTag(form, 'button');

        input.value = 'changed';

        TestUtils.Simulate.change(input);

        assert.equal(get(store.getState().test, 'foo'), 'changed');

        TestUtils.Simulate.click(reset);

        assert.equal(get(store.getState().test, 'foo'), '');
      });
    });

    describe('programmatically submitting', () => {
      it('the form node should be able to be submitted with submit()', () => {
        const initialState = getInitialState({ foo: '' });
        const store = testCreateStore({
          test: modelReducer('test', initialState),
          testForm: formReducer('test', initialState),
        });

        const handleSubmit = sinon.spy((val) => val);

        const app = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Form
              model="test"
              onSubmit={handleSubmit}
            >
              <Field
                model="test.foo"
              >
                <input type="text" />
              </Field>
            </Form>
          </Provider>
        );

        const form = TestUtils.findRenderedDOMComponentWithTag(app, 'form');

        form.submit();

        assert.isTrue(handleSubmit.calledOnce);
      });
    });

    it('the form node should be able to be referenced', () => {
      const initialState = getInitialState({ foo: '' });
      const store = testCreateStore({
        test: modelReducer('test', initialState),
        testForm: formReducer('test', initialState),
      });

      const handleSubmit = sinon.spy((val) => val);

      class App extends React.Component {
        attachNode(node) {
          this.node = findDOMNode(node);
        }

        handleClick() {
          this.node.submit();
        }

        render() {
          return (
            <div>
              <Form
                model="test"
                onSubmit={handleSubmit}
                ref={this.attachNode.bind(this)}
              >
                <Field
                  model="test.foo"
                >
                  <input type="text" />
                </Field>
              </Form>
              <button onClick={this.handleClick.bind(this)} />
            </div>
          );
        }
      }

      const app = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <App />
        </Provider>
      );

      const button = TestUtils.findRenderedDOMComponentWithTag(app, 'button');

      TestUtils.Simulate.click(button);

      assert.isTrue(handleSubmit.calledOnce);
    });

    describe('function as children', () => {
      const initialState = getInitialState({ foo: 'bar' });
      const store = testCreateStore({
        test: modelReducer('test', initialState),
        testForm: formReducer('test', initialState),
      });
      const form = testRender(
        <Form model="test">
          {(formValue) =>
            <Field model={`${formValue.$form.model}.foo`}>
              <input className={formValue.foo.focus ? 'focused' : ''} />
            </Field>
          }
        </Form>, store);

      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

      it('treats the return value as expected with normal children', () => {
        assert.equal(input.value, 'bar');

        input.value = 'testing';
        TestUtils.Simulate.change(input);

        assert.equal(input.value, 'testing');
        assert.equal(get(store.getState().test, 'foo'), 'testing');
      });

      it('rerenders the function when the form value changes', () => {
        assert.throws(() => TestUtils.findRenderedDOMComponentWithClass(form, 'focused'));

        TestUtils.Simulate.focus(input);

        assert.isTrue(store.getState().testForm.foo.focus);

        assert.ok(TestUtils.findRenderedDOMComponentWithClass(form, 'focused'));
      });
    });

    describe('validation on validation prop change', () => {
      const initialState = getInitialState({
        foo: '',
        bar: '',
      });
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', initialState),
      });

      let timesOneValidationCalled = 0;
      let timesTwoValidationCalled = 0;

      class ValidationChanger extends React.Component {
        constructor() {
          super();
          this.state = { validateOne: true };
        }

        toggleValidateOne = () => {
          this.setState({ validateOne: !this.state.validateOne });
        };

        validators() {
          if (this.state.validateOne) {
            return {
              foo: () => {
                timesOneValidationCalled += 1;
                return true;
              },
            };
          }
          return {
            foo: () => {
              timesTwoValidationCalled += 1;
              return true;
            },
          };
        }

        render() {
          return (
            <Provider store={store}>
              <Form model="test" validators={this.validators()}>
                <Field model="test.foo">
                  <input type="text" />
                </Field>
                <button onClick={this.toggleValidateOne}>Toggle One Validate</button>
              </Form>
            </Provider>
          );
        }
      }

      const form = TestUtils.renderIntoDocument(<ValidationChanger />);

      const [toggleButton] = TestUtils.scryRenderedDOMComponentsWithTag(form, 'button');

      it('should validate form validators initially on load', () => {
        assert.equal(timesOneValidationCalled, 1);
        assert.equal(timesTwoValidationCalled, 0);
      });

      it('should revalidate on form validators changing', () => {
        TestUtils.Simulate.click(toggleButton);

        assert.equal(timesOneValidationCalled, 1);
        assert.equal(timesTwoValidationCalled, 1);
      });
    });

    describe('validation of nested/deep model values', () => {
      const initialState = getInitialState({
        items: [
          { name: 'one' },
          { name: 'two' },
        ],
      });
      const store = testCreateStore({
        testForm: formReducer('test', initialState),
        test: modelReducer('test', initialState),
      });
      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            validators={{
              'items[].name': (name) => name && name.length,
            }}
          >
          {get(initialState, 'items').map((item, i) =>
            <Control model={`test.items[${i}].name`} />
          )}
          </Form>
        </Provider>
      );
      const formElement = TestUtils.findRenderedDOMComponentWithTag(form, 'form');

      const [_, input2] = TestUtils
        .scryRenderedDOMComponentsWithTag(form, 'input');

      it('should initially validate each item', () => {
        const { $form, items } = store.getState().testForm;
        assert.isTrue(items[0].name.valid);
        assert.isTrue(items[1].name.valid);
        assert.isTrue($form.valid);
      });

      it('after submit should stay valid', () => {
        TestUtils.Simulate.submit(formElement);
        const { $form, items } = store.getState().testForm;

        assert.isTrue(items[0].name.valid);
        assert.isTrue(items[1].name.valid);
        assert.isTrue($form.valid);
      });

      it('should check validity of each item on change', () => {
        input2.value = '';
        TestUtils.Simulate.change(input2);
        const { $form, items } = store.getState().testForm;

        assert.isTrue(items[0].name.valid);
        assert.isFalse(items[1].name.valid);
        assert.isFalse($form.valid);
      });
    });

    describe('submit after field invalid', () => {
      const initialState = getInitialState({ username: '' });
      const store = testCreateStore({
        login: modelReducer('login', initialState),
        loginForm: formReducer('login', initialState),
      });
      const handleSubmit = sinon.spy((val) => val);

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="login"
            onSubmit={handleSubmit}
            validators={{ username: (val) => !!val }}
            validateOn="submit"
          >
            <Field model="login.username">
              <input />
            </Field>
          </Form>
        </Provider>
      );

      const formNode = TestUtils.findRenderedDOMComponentWithTag(form, 'form');
      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

      it('should be invalid after initial submit', () => {
        TestUtils.Simulate.submit(formNode);

        assert.isTrue(handleSubmit.callCount === 0);

        assert.isFalse(store.getState().loginForm.$form.valid);
        assert.isFalse(store.getState().loginForm.username.valid);
      });

      it('should submit after found to be valid', () => {
        input.value = 'changed';

        TestUtils.Simulate.change(input);

        assert.isFalse(store.getState().loginForm.username.valid,
          'should not be valid yet');

        TestUtils.Simulate.submit(formNode);

        assert.isTrue(store.getState().loginForm.$form.valid);
        assert.isTrue(store.getState().loginForm.username.valid);

        assert.isTrue(handleSubmit.calledOnce);
      });
    });

    describe('form-wide validation with no form validators', () => {
      const initialState = getInitialState({ foo: '', bar: '' });

      const store = testCreateStore({
        test: modelReducer('test', initialState),
        testForm: formReducer('test', initialState),
      });

      const required = (val) => !!(val && val.length);

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form model="test">
            <Control model=".foo" validators={{ required }} />
            <Control model=".bar" validators={{ required }} />
          </Form>
        </Provider>
      );

      const [foo, bar] = TestUtils.scryRenderedDOMComponentsWithTag(form, 'input');

      it('should initially be invalid', () => {
        assert.isFalse(store.getState().testForm.$form.valid);
      });

      it('should still be invalid after only one field made valid', () => {
        foo.value = 'changed';

        TestUtils.Simulate.change(foo);

        assert.isTrue(store.getState().testForm.foo.valid);
        assert.isFalse(store.getState().testForm.$form.valid);
      });

      it('should be valid after only both fields are made valid', () => {
        foo.value = 'changed';
        bar.value = 'changed';

        TestUtils.Simulate.change(foo);
        TestUtils.Simulate.change(bar);

        assert.isTrue(store.getState().testForm.foo.valid);
        assert.isTrue(store.getState().testForm.bar.valid);
        assert.isTrue(store.getState().testForm.$form.valid);
      });
    });

    describe('form validation as function', () => {
      const initialState = getInitialState({
        items: [
          { name: 'one' },
          { name: 'two' },
          { name: 'three' },
          { name: 'four' },
        ],
      });
      const store = testCreateStore({
        testForm: formReducer('test', initialState),
        test: modelReducer('test', initialState),
      });

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            validators={(model) => {
              const field1 = 'items[0].name';
              const field2 = 'items[1].name';
              const field4 = 'items[3].name';
              const hasValue = (value) => value && value.length;

              const field1Value = get(model, field1);
              const field2Value = get(model, field2);
              const field4Value = get(model, field4);

              const notRequired = () => Boolean(hasValue(field1Value) || hasValue(field2Value));
              const containsOne = field1Value.includes('one');
              const validations = {};

              validations[field1] = {
                required: notRequired(),
                needsOne: containsOne,
              };
              validations[field2] = {
                required: notRequired(),
              };
              validations[field4] = {
                required: hasValue(field4Value),
              };
              return validations;
            }}
            errors={{
              'items[2].name': (value) => (
                value.includes('three')
                  ? false
                  : { invalidThree: 'invalid three' }
              ),
            }}
          >
            <Control model="test.items[0].name" />
            <Control model="test.items[1].name" />
            <Control model="test.items[2].name" />
            <Control
              model="test.items[3].name"
              validators={{
                needsFour: (val) => val.includes('four'),
              }}
            />
          </Form>
        </Provider>
      );

      const [input1, input2, input3, input4] = TestUtils
        .scryRenderedDOMComponentsWithTag(form, 'input');

      it('should initially validate each item', () => {
        const { $form, items } = store.getState().testForm;
        assert.isTrue(items[0].name.valid);
        assert.isTrue(items[1].name.valid);
        assert.isTrue($form.valid);
      });

      it('should check validity of each item on change', () => {
        input2.value = '';
        TestUtils.Simulate.change(input2);
        const { $form, items } = store.getState().testForm;

        assert.isTrue(items[0].name.valid);
        assert.isTrue(items[1].name.valid);
        assert.isTrue($form.valid);

        input1.value = '';
        TestUtils.Simulate.change(input1);

        const { $form: $form1, items: items1 } = store.getState().testForm;

        assert.isFalse(items1[0].name.valid);
        assert.isFalse(items1[1].name.valid);
        assert.isFalse($form1.valid);
      });

      it('should set validation type on change', () => {
        input2.value = '';
        TestUtils.Simulate.change(input2);
        input1.value = '';
        TestUtils.Simulate.change(input1);
        const { $form, items } = store.getState().testForm;

        assert.isFalse(items[0].name.validity.required);
        assert.isTrue(items[0].name.errors.required);
        assert.isFalse(items[1].name.validity.required);
        assert.isTrue(items[1].name.errors.required);
        assert.isFalse($form.valid);
      });

      it('should aggregate errors and validations.', () => {
        input1.value = '';
        TestUtils.Simulate.change(input1);
        input2.value = '';
        TestUtils.Simulate.change(input2);
        input3.value = 'foo';
        TestUtils.Simulate.change(input3);
        const { $form, items } = store.getState().testForm;

        assert.isFalse(items[0].name.validity.required);
        assert.isFalse(items[0].name.validity.needsOne);

        assert.isTrue(items[0].name.errors.required);
        assert.isTrue(items[0].name.errors.needsOne);

        assert.isFalse(items[1].name.validity.required);
        assert.isTrue(items[1].name.errors.required);

        assert.isFalse(items[2].name.validity.invalidThree);
        assert.equal(items[2].name.errors.invalidThree, 'invalid three');

        assert.isFalse($form.valid);
      });

      it('should aggregate form validations and field validations.', () => {
        input4.value = '';
        TestUtils.Simulate.change(input4);

        const { $form, items } = store.getState().testForm;

        assert.isFalse(items[3].name.validity.required);
        assert.isFalse(items[3].name.validity.needsFour);

        assert.isTrue(items[3].name.errors.required);
        assert.isTrue(items[3].name.errors.needsFour);

        assert.isFalse($form.valid);
      });
    });

    describe('submit valid form no validators', () => {
      const initialState = getInitialState({ foo: '' });

      const store = testCreateStore({
        test: modelReducer('test', initialState),
        testForm: formReducer('test', initialState),
      });

      const handleSubmit = sinon.spy((val) => val);

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            onSubmit={handleSubmit}
          >
            <Control model=".foo" />
          </Form>
        </Provider>
      );

      const formNode = TestUtils.findRenderedDOMComponentWithTag(form, 'form');

      it('should initially be valid and not pending', () => {
        assert.isTrue(store.getState().testForm.$form.valid);
        assert.isFalse(store.getState().testForm.$form.pending);
      });

      it('should call onSubmit() prop and not set to pending after submitting', () => {
        TestUtils.Simulate.submit(formNode);

        assert.isTrue(handleSubmit.calledOnce);

        assert.isFalse(store.getState().testForm.$form.pending);
        assert.isFalse(store.getState().testForm.$form.submitFailed);
      });
    });

    describe('triggering a submit remotely', () => {
      const initialState = getInitialState({ foo: '' });

      const store = testCreateStore({
        test: modelReducer('test', initialState),
        testForm: formReducer('test', initialState),
      });

      const handleSubmit = sinon.spy((val) => val);

      TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            onSubmit={handleSubmit}
          >
            <Control model=".foo" />
          </Form>
        </Provider>
      );

      it('should call onSubmit() prop when submit intent is remotely triggered', () => {
        store.dispatch(actions.submit('test'));

        assert.isTrue(handleSubmit.calledOnce);
      });
    });

    describe('onSubmitFailed() prop', () => {
      it('should call onSubmitFailed() prop if submit attempted with invalid form', () => {
        const initialState = getInitialState({ foo: '' });

        const store = testCreateStore({
          test: modelReducer('test', initialState),
          testForm: formReducer('test', initialState),
        });

        let handleSubmitFailedCalledWith = null;

        function handleSubmitFailed(val) {
          handleSubmitFailedCalledWith = val;
        }

        const form = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Form
              model="test"
              onSubmitFailed={handleSubmitFailed}
              validators={{
                foo: (val) => val.length,
              }}
            >
              <Control model=".foo" />
            </Form>
          </Provider>
        );

        const formNode = TestUtils.findRenderedDOMComponentWithTag(form, 'form');

        TestUtils.Simulate.submit(formNode);

        assert.containSubset(handleSubmitFailedCalledWith, {
          $form: {
            model: 'test',
            valid: false,
          },
          foo: {
            model: 'test.foo',
            valid: false,
            errors: true,
          },
        });

        assert.isFalse(store.getState().testForm.$form.pending);
        assert.isTrue(store.getState().testForm.$form.submitFailed);
      });
    });

    describe('getDispatch() prop', () => {
      it('should provide dispatch to callback', (done) => {
        const initialState = getInitialState({ foo: '' });

        const store = testCreateStore({
          test: modelReducer('test', initialState),
          testForm: formReducer('test', initialState),
        });

        function handleGetDispatch(dispatch) {
          assert.isFunction(dispatch);

          dispatch(actions.setPending('test.foo'));

          assert.isTrue(store.getState().testForm.foo.pending);

          done();
        }

        TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Form
              model="test"
              getDispatch={handleGetDispatch}
            />
          </Provider>
        );
      });
    });

    describe('deep async validity', () => {
      const initialState = getInitialState({ foo: '' });

      const store = testCreateStore({
        test: modelReducer('test', initialState),
        testForm: formReducer('test', initialState),
      });

      const handleSubmit = sinon.spy((val) => val);

      TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Form
            model="test"
            onSubmit={handleSubmit}
          >
            <Control model=".foo" />
          </Form>
        </Provider>
      );

      beforeEach(() => {
        store.dispatch(actions.reset('test'));
      });

      it('should allow submit if non-async validity is valid', () => {
        store.dispatch(actions.setValidity('test.foo', { asyncValid: false }, { async: true }));
        store.dispatch(actions.setValidity('test.foo', { syncValid: false }, { merge: true }));

        assert.isFalse(store.getState().testForm.foo.valid);

        store.dispatch(actions.submit('test'));

        assert.isFalse(handleSubmit.calledOnce,
          'not called because sync validity is invalid');

        store.dispatch(actions.setValidity('test.foo', { syncValid: true }, { merge: true }));

        assert.isFalse(store.getState().testForm.foo.valid);

        store.dispatch(actions.submit('test'));

        assert.isTrue(handleSubmit.calledOnce,
          'called because sync validity is valid');
      });
    });

    describe('form and field combined validation', () => {
      it('should combine form and field validation', () => {
        const initialUserState = getInitialState({ name: '' });

        const store = createStore(combineForms({
          user: initialUserState,
        }));

        const app = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Form
              model="user"
              validators={() => ({ name: { formValidation: false } })}
              validateOn="submit"
            >
              <Field
                model=".name"
                validators={{ fieldValidation: (value) => value && value.length }} validateOn="blur"
              >
                <input type="text" />
              </Field>

              <button type="submit">Submit</button>
            </Form>
          </Provider>
        );

        const form = TestUtils.findRenderedDOMComponentWithTag(app, 'form');

        TestUtils.Simulate.submit(form);

        assert.deepEqual(store.getState().forms.user.name.validity, {
          fieldValidation: false,
          formValidation: false,
        });
      });
    });
  });
});
