/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import { Form, modelReducer, formReducer, Field } from '../src';

describe('<Form> component', () => {
  describe('wraps component if specified', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test', {}),
      test: modelReducer('test'),
    }));

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
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test', {}),
      test: modelReducer('test'),
    }));

    let timesValidated = 0;

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Form model="test"
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

    it('should only have validated once (on load) before submit', () => {
      assert.equal(timesValidated, 1);
    });

    it('should not validate on change', () => {
      TestUtils.Simulate.change(fooControl);

      assert.equal(timesValidated, 1);
    });

    it('should validate all validators on submit', () => {
      TestUtils.Simulate.submit(formElement);

      assert.equal(timesValidated, 2);

      assert.containSubset(
        store.getState().testForm.fields.foo,
        { valid: false });

      fooControl.value = 'testing foo';

      TestUtils.Simulate.change(fooControl);

      assert.equal(timesValidated, 2);

      TestUtils.Simulate.submit(formElement);

      assert.equal(timesValidated, 3);

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

  describe('error validation on submit', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', {
        bar: '',
      }),
    }));

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Form model="test"
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
        store.getState().testForm.fields.foo,
        {
          valid: false,
          errors: 'invalid foo',
        });

      fooControl.value = 'valid foo';

      TestUtils.Simulate.change(fooControl);

      TestUtils.Simulate.submit(formElement);

      assert.containSubset(
        store.getState().testForm.fields.foo,
        {
          valid: true,
          errors: false,
        });
    });

    it('should allow for keywise validation', () => {
      TestUtils.Simulate.submit(formElement);

      assert.containSubset(
        store.getState().testForm.fields.bar,
        {
          errors: {
            one: 'bar too short',
            two: false,
          },
          valid: false,
        });

      barControl.value = '1';
      TestUtils.Simulate.change(barControl);
      TestUtils.Simulate.submit(formElement);

      assert.containSubset(
        store.getState().testForm.fields.bar,
        {
          errors: {
            one: false,
            two: false,
          },
          valid: true,
        });

      barControl.value = '12';
      TestUtils.Simulate.change(barControl);
      TestUtils.Simulate.submit(formElement);

      assert.containSubset(
        store.getState().testForm.fields.bar,
        {
          errors: {
            one: false,
            two: false,
          },
          valid: true,
        });

      barControl.value = '123';
      TestUtils.Simulate.change(barControl);
      TestUtils.Simulate.submit(formElement);

      assert.containSubset(
        store.getState().testForm.fields.bar,
        {
          errors: {
            one: false,
            two: 'bar too long',
          },
          valid: false,
        });
    });
  });

  describe('validation on change (default)', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', { bar: '' }),
    }));

    let timesBarValidationCalled = 0;

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Form model="test"
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

      assert.equal(timesBarValidationCalled, 1);
    });
  });

  describe('error validation on change', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', { bar: '' }),
    }));

    let timesBarValidationCalled = 0;

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Form model="test"
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
        store.getState().testForm.fields.foo,
        {
          errors: 'invalid foo',
          valid: false,
        });

      fooControl.value = 'valid foo';

      TestUtils.Simulate.change(fooControl);

      assert.containSubset(
        store.getState().testForm.fields.foo,
        {
          errors: false,
          valid: true,
        });
    });

    it('should NOT run validation for fields that have not changed', () => {
      fooControl.value = 'testing';

      TestUtils.Simulate.change(fooControl);

      assert.equal(timesBarValidationCalled, 1);
    });
  });

  describe('onSubmit() prop', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test'),
    }));

    let submitValue = null;

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Form model="test"
          validators={{
            foo: (val) => val && val === 'valid',
            baz: {
              validationKey: (val) => val && val === 'valid',
            },
          }}
          errors={{
            bar: (val) => val !== 'bar' && 'bar invalid',
          }}
          onSubmit={(val) => (submitValue = val, true)}
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

      assert.isNull(submitValue);
    });

    it('should set submitFailed to true if form is invalid and submitted', () => {
      TestUtils.Simulate.submit(formElement);

      assert.isTrue(store.getState().testForm.submitFailed);
    });

    it('should call onSubmit with model value if form is valid', () => {
      barControl.value = 'bar';

      TestUtils.Simulate.change(barControl);

      TestUtils.Simulate.submit(formElement);

      assert.isNull(submitValue,
        'should not be valid yet because baz is still invalid');

      bazControl.value = 'valid';

      TestUtils.Simulate.change(bazControl);

      TestUtils.Simulate.submit(formElement);

      assert.deepEqual(
        submitValue,
        {
          bar: 'bar',
          baz: 'valid',
          foo: 'valid',
        });
    });
  });

  describe('validation of form itself', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', {
        foo: '',
        bar: '',
      }),
    }));

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Form model="test"
          validators={{
            '': {
              foobar: (val) => val.foo + val.bar === 'foobar',
            },
          }}
          errors={{
            '': {
              formError: (val) => val.foo === 'error' && 'form error',
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

    it('should be able to set keyed errors to the form model', () => {
      fooControl.value = 'error';

      TestUtils.Simulate.change(fooControl);
      TestUtils.Simulate.submit(formElement);

      assert.containSubset(
        store.getState().testForm,
        {
          valid: false,
          errors: {
            foobar: true,
            formError: 'form error',
          },
        });
    });
  });

  describe('external validators', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', {
        foo: '',
        bar: '',
      }),
    }));

    let timesSubmitCalled = 0;

    function handleSubmit() {
      timesSubmitCalled++;
    }

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Form model="test"
          onSubmit={handleSubmit}
        >
          <Field model="test.foo"
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

  describe('internal validators without form reducers', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      test: modelReducer('test', {
        foo: '',
        bar: '',
      }),
    }));

    let timesSubmitCalled = 0;

    function handleSubmit() {
      timesSubmitCalled++;
    }

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Form model="test"
          validators={{
            foo: (val) => val && val.length > 5,
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

  describe('plain form without form reducers', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      test: modelReducer('test', {
        foo: '',
        bar: '',
      }),
    }));

    let timesSubmitCalled = 0;

    function handleSubmit() {
      timesSubmitCalled++;
    }

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Form model="test"
          onSubmit={handleSubmit}
        >
          <Field model="test.foo">
            <input type="text" />
          </Field>
        </Form>
      </Provider>
    );

    const formElement = TestUtils.findRenderedDOMComponentWithTag(form, 'form');

    it('should handle submit without any errors', () => {
      assert.doesNotThrow(() => {
        TestUtils.Simulate.submit(formElement);

        assert.equal(timesSubmitCalled, 1);
      });
    });
  });

  describe('deep state path', () => {
    const fromsReducer = combineReducers({
      testForm: formReducer('forms.test'),
      test: modelReducer('forms.test', {
        foo: '',
        bar: '',
      }),
    });
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      forms: fromsReducer,
    }));

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Form model="forms.test" onSubmit={() => {}} />
      </Provider>
    );

    const component = TestUtils.findRenderedComponentWithType(form, Form);
    const props = component.renderedElement.props;

    it('should resolve the model value', () => {
      assert.containSubset(props.modelValue, { foo: '', bar: '' });
    });

    it('should resolve the form value', () => {
      assert.containSubset(props.formValue, { valid: true, model: 'forms.test' });
    });
  });
});
