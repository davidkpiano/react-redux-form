/* eslint-disable */
import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import { Form, modelReducer, formReducer, Field, Errors, actions } from '../src';

describe('<Errors />', () => {
  it('should exist', () => {
    assert.ok(Errors);
  });

  describe('displaying errors from messages', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test', { foo: '' }),
      test: modelReducer('test', { foo: '' }),
    }));

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <form>
          <Errors model="test.foo" 
            messages={{
              required: 'This field is required',
              valid: 'This field is invalid',
            }}
          />
          <Field model="test.foo"
            validators={{
              required: (v) => v && v.length,
              valid: (v) => v === 'valid',
            }}
          >
            <input type="text" />
          </Field>
        </form>
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');
    const errors = TestUtils.scryRenderedDOMComponentsWithTag(form, 'span');

    it('should display all errors', () => {
      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');
      const errors = TestUtils.scryRenderedDOMComponentsWithTag(form, 'span');
      assert.lengthOf(errors, 2);
      assert.equal(errors[0].innerHTML, 'This field is required');
      assert.equal(errors[1].innerHTML, 'This field is invalid');
    });

    it('should display only relevant errors when validity changes', () => {
      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');
      
      input.value = 'invalid';

      TestUtils.Simulate.change(input);

      const errors = TestUtils.scryRenderedDOMComponentsWithTag(form, 'span');

      assert.lengthOf(errors, 1);
      assert.equal(errors[0].innerHTML, 'This field is invalid');
    });

    it('should not display any errors for a valid field', () => {
      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');
      
      input.value = 'valid';

      TestUtils.Simulate.change(input);

      const errors = TestUtils.scryRenderedDOMComponentsWithTag(form, 'span');

      assert.lengthOf(errors, 0);
    });
  });

  describe('displaying errors from field .errors', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test', {}),
      test: modelReducer('test'),
    }));

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <form>
          <Errors model="test.foo" 
            messages={{
              required: 'This field is required',
            }}
          />
          <Field model="test.foo"
            validators={{
              required: (v) => v && v.length,
            }}
            errors={{
              valid: (v) => v !== 'valid' && 'This field is invalid',
            }}
          >
            <input type="text" />
          </Field>
        </form>
      </Provider>
    );

    it('should display all errors', () => {
      const errors = TestUtils.scryRenderedDOMComponentsWithTag(form, 'span');
      assert.lengthOf(errors, 2);
      assert.equal(errors[0].innerHTML, 'This field is required');
      assert.equal(errors[1].innerHTML, 'This field is invalid');
    });
  });

  describe('displaying errors from form .errors', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test', { foo: '' }),
      test: modelReducer('test', { foo: '' }),
    }));

    let formValid = false;

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Form model="test"
          validators={{
            '': { foo: ({ foo }) => foo && foo.length },
          }}
        >
          <Errors model="test" 
            messages={{
              foo: 'This form is invalid',
            }}
          />
          <Field model="test.foo">
            <input type="text" />
          </Field>
        </Form>
      </Provider>
    );

    const errors = TestUtils.scryRenderedDOMComponentsWithTag(form, 'span');
    const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

    it('should display all form errors', () => {
      const errors = TestUtils.scryRenderedDOMComponentsWithTag(form, 'span');
      assert.lengthOf(errors, 1);
      assert.equal(errors[0].innerHTML, 'This form is invalid');
    });

    it('should not display form errors if form is valid', () => {
      input.value = 'testing';

      TestUtils.Simulate.change(input);

      const errors = TestUtils.scryRenderedDOMComponentsWithTag(form, 'span');
      assert.lengthOf(errors, 0);
    });
  });

  describe('displaying no errors', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test', { foo: '' }),
      test: modelReducer('test', { foo: '' }),
    }));

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Errors model="test"/>
      </Provider>
    );

    it('should not render a component if there are no errors', () => {
      const divs = TestUtils.scryRenderedDOMComponentsWithTag(form, 'div');
      assert.lengthOf(divs, 0);
    });
  });

  describe('displaying custom messages', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test', { foo: '' }),
      test: modelReducer('test', { foo: '' }),
    }));

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <form>
          <Errors model="test.foo" 
            messages={{
              length: (val) => `${val && val.length} chars is too short`,
              doNotShow: () => false,
            }}
          />
          <Field model="test.foo"
            validators={{
              length: (v) => v && v.length && v.length > 5,
              doNotShow: () => false,
            }}
          >
            <input type="text" />
          </Field>
        </form>
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

    it('should return messages from functions called with the model value', () => {    
      input.value = 'four';

      TestUtils.Simulate.change(input);

      const errors = TestUtils.scryRenderedDOMComponentsWithTag(form, 'span');

      assert.lengthOf(errors, 1);

      assert.equal(errors[0].innerHTML, '4 chars is too short');
    });

    it('should not show messages when functions return falsey values', () => {
      TestUtils.Simulate.change(input);

      const errors = TestUtils.scryRenderedDOMComponentsWithTag(form, 'span');

      assert.property(store.getState().testForm.fields.foo.errors, 'doNotShow');

      assert.isTrue(store.getState().testForm.fields.foo.errors.doNotShow);

      assert.lengthOf(errors, 1);
    });
  });

  describe('the "show" prop', () => {
    function renderErrorsWithShow(show) {
      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        testForm: formReducer('test', {}),
        test: modelReducer('test'),
      }));

      return TestUtils.renderIntoDocument(
        <Provider store={store}>
          <form>
            <Errors model="test.foo" 
              messages={{
                required: 'This field is required',
              }}
              show={ show }
            />
            <Field model="test.foo"
              validators={{
                required: (v) => v && v.length,
              }}
            >
              <input type="text" />
            </Field>
          </form>
        </Provider>
      );
    }

    it('should support a function that shows based on field value', () => {
      const showFn = (field) => field.focus;

      const form = renderErrorsWithShow(showFn);
      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 0);

      TestUtils.Simulate.focus(input);

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 1);

      TestUtils.Simulate.blur(input);

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 0);
    });

    it('should support a function that shows based on field and form value', () => {
      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        testForm: formReducer('test', {}),
        test: modelReducer('test'),
      }));

      const showFn = (field, form) => field.focus || form.submitFailed;

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <form>
            <Errors model="test.foo" 
              messages={{
                required: 'This field is required',
              }}
              show={ showFn }
            />
            <Field model="test.foo"
              validators={{
                required: (v) => v && v.length,
              }}
            >
              <input type="text" />
            </Field>
          </form>
        </Provider>
      );

      const formElement = TestUtils.findRenderedDOMComponentWithTag(form, 'form');
      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 0);

      TestUtils.Simulate.focus(input);

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 1);

      TestUtils.Simulate.blur(input);

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 0);

      store.dispatch(actions.setSubmitFailed('test'));

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 1, 'form submit failed');
    });

    it('should support a boolean and show if truthy', () => {
      const form = renderErrorsWithShow(true);
      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 1);
    });

    it('should support a boolean and not show if falsey', () => {
      const form = renderErrorsWithShow(false);
      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 0);

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'div'), 0);
    });

    it('should support a string and show if that field property is truthy', () => {
      const form = renderErrorsWithShow('focus');
      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 0);

      TestUtils.Simulate.focus(input);

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 1);

      TestUtils.Simulate.blur(input);

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 0);
    });

    it('should support an object and show if the properties match', () => {
      const form = renderErrorsWithShow({
        focus: true,
        touched: true,
      });

      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 0,
        'not focused yet');

      TestUtils.Simulate.focus(input);

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 0,
        'not touched yet');

      TestUtils.Simulate.blur(input);

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 0,
        'touched but not focused');

      TestUtils.Simulate.focus(input);

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 1,
        'touched and focused');

      TestUtils.Simulate.blur(input);

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 0,
        'touched but not focused');
    });
  });

  describe('the "wrapper" prop', () => {
    function renderErrorsWithWrapper(wrapper, props) {    
      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        testForm: formReducer('test', {}),
        test: modelReducer('test'),
      }));

      return TestUtils.renderIntoDocument(
        <Provider store={store}>
          <form>
            <Errors model="test.foo"
              wrapper={wrapper}
              messages={{
                foo: 'foo error',
                bar: 'bar error',
              }}
              {...props}
            />
            <Field model="test.foo"
              validators={{
                foo: () => false,
                bar: () => false,
              }}
            >
              <input type="text" />
            </Field>
          </form>
        </Provider>
      );
    }

    it('should render a <div> wrapper by default', () => {
      const form = renderErrorsWithWrapper();

      const wrapper = TestUtils.scryRenderedDOMComponentsWithTag(form, 'div');

      assert.lengthOf(wrapper, 1);

      assert.equal(wrapper[0].childNodes.length, 2);
    });

    it('should render a specified HTML element wrapper', () => {
      const form = renderErrorsWithWrapper('section');

      const wrapper = TestUtils.scryRenderedDOMComponentsWithTag(form, 'section');

      assert.lengthOf(wrapper, 1);

      assert.equal(wrapper[0].childNodes.length, 2);
    });

    it('should render a specified React component (class)', () => {
      class Wrapper extends React.Component {
        render() {
          return <main className="wrapper">{ this.props.children }</main>;
        }
      }

      const form = renderErrorsWithWrapper(Wrapper);

      const wrapper = TestUtils.scryRenderedDOMComponentsWithClass(form, 'wrapper');

      assert.lengthOf(wrapper, 1);

      assert.equal(wrapper[0].childNodes.length, 2);
    });

    it('should render a specified React component (function) with error props', () => {
      function Wrapper(props) {
        assert.property(props, 'model');
        assert.property(props, 'modelValue');
        assert.property(props, 'fieldValue');
        assert.property(props, 'messages');
        assert.property(props, 'show');
        assert.property(props, 'component');

        assert.equal(props.model, 'test.foo');

        return <div className="wrapper">{props.children}</div>;
      }

      const form = renderErrorsWithWrapper(Wrapper);

      const wrapper = TestUtils.scryRenderedDOMComponentsWithClass(form, 'wrapper');

      assert.lengthOf(wrapper, 1);

      assert.equal(wrapper[0].childNodes.length, 2);
    });

    it('should render a specified React component with non-proprietary props', () => {
      function Wrapper(props) {
        assert.property(props, 'className');

        return <div {...props}>{props.children}</div>;
      }

      const props = { className: 'custom-class' };

      const form = renderErrorsWithWrapper(Wrapper, props);

      const wrapper = TestUtils.scryRenderedDOMComponentsWithClass(form, 'custom-class');

      assert.lengthOf(wrapper, 1);

      assert.equal(wrapper[0].childNodes.length, 2);
    });
  });

  describe('the "component" prop', () => {
    function renderErrorsWithComponent(component) {    
      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        testForm: formReducer('test', {}),
        test: modelReducer('test'),
      }));

      return TestUtils.renderIntoDocument(
        <Provider store={store}>
          <form>
            <Errors model="test.foo"
              component={component}
              messages={{
                foo: 'foo error',
                bar: 'bar error',
              }}
            />
            <Field model="test.foo"
              validators={{
                foo: () => false,
                bar: () => false,
              }}
            >
              <input type="text" />
            </Field>
          </form>
        </Provider>
      );
    }

    it('should render a <span> component by default', () => {
      const form = renderErrorsWithComponent();

      const components = TestUtils.scryRenderedDOMComponentsWithTag(form, 'span');

      assert.lengthOf(components, 2);

      assert.equal(components[0].innerHTML, 'foo error');
      assert.equal(components[1].innerHTML, 'bar error');
    });

    it('should render a specified HTML element component', () => {
      const form = renderErrorsWithComponent('p');

      const components = TestUtils.scryRenderedDOMComponentsWithTag(form, 'p');

      assert.lengthOf(components, 2);

      assert.equal(components[0].innerHTML, 'foo error');
      assert.equal(components[1].innerHTML, 'bar error');
    });

    it('should render a specified React component (class)', () => {
      class ErrorComponent extends React.Component {
        render() {
          return <main className="component">{ this.props.children }</main>;
        }
      }

      const form = renderErrorsWithComponent(ErrorComponent);

      const components = TestUtils.scryRenderedDOMComponentsWithClass(form, 'component');

      assert.lengthOf(components, 2);

      assert.equal(components[0].innerHTML, 'foo error');
      assert.equal(components[1].innerHTML, 'bar error');
    });

    it('should render a specified React component (function) with error props', () => {
      function ErrorComponent(props) {
        assert.property(props, 'model');
        assert.property(props, 'modelValue');
        assert.property(props, 'fieldValue');

        assert.equal(props.model, 'test.foo');

        return <div className="component">{props.children}</div>;
      }

      const form = renderErrorsWithComponent(ErrorComponent);

      const components = TestUtils.scryRenderedDOMComponentsWithClass(form, 'component');

      assert.lengthOf(components, 2);

      assert.equal(components[0].innerHTML, 'foo error');
      assert.equal(components[1].innerHTML, 'bar error');
    });
  });

  describe('deep model paths', () => {
    it('should work with deep model paths', () => {
      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        forms: combineReducers({
          testForm: formReducer('forms.test', {}),
          test: modelReducer('forms.test'),
        }),
      }));

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <form>
            <Errors model="forms.test.foo"
              messages={{
                required: 'This field is required',
              }}
            />
            <Field model="forms.test.foo"
              validators={{
                required: (v) => v && v.length,
              }}
            >
              <input type="text" />
            </Field>
          </form>
        </Provider>
      );

      const spans = TestUtils.scryRenderedDOMComponentsWithTag(form, 'span')
      assert.lengthOf(spans, 1);
      assert.equal(spans[0].innerHTML, 'This field is required')
    });
  });

  describe('single string error messages', () => {
    it('should work with single string error messages', () => {
      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        testForm: formReducer('test', {}),
        test: modelReducer('test'),
      }));
     
      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Errors model="test" messages={{
            foo: 'foo',
            bar: 'bar',
          }}/>
        </Provider>
      );

      store.dispatch(actions.setErrors('test', 'this is a single error message'));

      let error;

      assert.doesNotThrow(() => error = TestUtils
        .findRenderedDOMComponentWithTag(form, 'span'));

      assert.equal(error.innerHTML, 'this is a single error message');
    });
  });
});
