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


    // console.log(errors[0].childNodes);
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
  })
});
