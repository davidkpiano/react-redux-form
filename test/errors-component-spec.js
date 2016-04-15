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
      testForm: formReducer('test', {}),
      test: modelReducer('test'),
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

    const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');
    const errors = TestUtils.scryRenderedDOMComponentsWithTag(form, 'span');

    it('should display all errors', () => {
      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');
      const errors = TestUtils.scryRenderedDOMComponentsWithTag(form, 'span');
      assert.lengthOf(errors, 2);
      assert.equal(errors[0].innerHTML, 'This field is required');
      assert.equal(errors[1].innerHTML, 'This field is invalid');
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

    it('should support a boolean and show if truthy', () => {
      const form = renderErrorsWithShow(true);
      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 1);
    });

    it('should support a boolean and not show if falsey', () => {
      const form = renderErrorsWithShow(false);
      const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

      assert.lengthOf(TestUtils.scryRenderedDOMComponentsWithTag(form, 'span'), 0);
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
});
