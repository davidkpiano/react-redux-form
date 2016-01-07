import React from 'react';
import chai from 'chai';
import chaiSubset from 'chai-subset';
import should from 'should';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import TestUtils from 'react-addons-test-utils';

import jsdom from 'jsdom';

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = {userAgent: 'node.js'};

chai.use(chaiSubset);

const { assert } = chai;

import { Field, actions, createFormReducer, createModelReducer, initialFieldState } from '../src';

describe('<Field /> component', () => {
  const textFieldElements = [
    ['input', 'text'],
    ['input', 'password'],
    ['input', 'number'],
    ['textarea']
  ];

  textFieldElements.map(([element, type]) => {
    describe(`<${element} ${type ? 'type="' + type + '"' : ''}/>`, () => {
      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        testForm: createFormReducer('test'),
        test: createModelReducer('test', { foo: 'bar' })
      }));
      let actions = [];
      let dispatch = (action) => actions.push(action);
      const foo = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field model="test.foo">
            { React.createElement(element, { type }) }
          </Field>
        </Provider>
      );

      const node = TestUtils.findRenderedDOMComponentWithTag(foo, element);

      it('should have an initial value from the model\'s initialState', () => {
        assert.equal(
          node.value,
          'bar');
      });

      it('should dispatch a focus event when focused', () => {    
        TestUtils.Simulate.focus(node);

        assert.containSubset(
          store.getState().testForm.field('test.foo'),
          { focus: true, blur: false });
      });

      it('should dispatch a blur event when blurred', () => {    
        TestUtils.Simulate.blur(node);

        assert.containSubset(
          store.getState().testForm.field('test.foo'),
          { focus: false, blur: true });
      });

      it('should dispatch a change event when changed', () => {
        node.value = 'testing';

        TestUtils.Simulate.change(node);

        assert.containSubset(
          store.getState().test.foo,
          'testing');
      });
    });
  })
});
