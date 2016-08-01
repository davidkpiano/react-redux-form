/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import { controls, modelReducer, formReducer, Control } from '../src';

function createTestStore(reducers) {
  return applyMiddleware(thunk)(createStore)(combineReducers(reducers));
}

describe('<Control> component', () => {
  describe('existence check', () => {
    it('should exist', () => {
      assert.ok(Control);
    });
  });

  describe('basic functionality', () => {
    const store = createTestStore({
      test: modelReducer('test', { foo: 'bar' }),
      testForm: formReducer('test', { foo: 'bar' }),
    });

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Control model="test.foo" mapProps={controls.text} component="input" />
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

    it('should work as expected with a model (happy path)', () => {
      assert.ok(input);
      assert.equal(input.value, 'bar');
    });

    it('should handle changes properly', () => {
      input.value = 'new';

      TestUtils.Simulate.change(input);

      assert.equal(store.getState().test.foo, 'new');
    });
  });

  describe('onLoad prop', () => {
    const store = createTestStore({
      test: modelReducer('test', { fff: 'bar' }),
      testForm: formReducer('test', { fff: 'bar' }),
    });

    const handleLoad = sinon.spy();

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Control
          model="test.fff"
          mapProps={controls.text}
          component="input"
          onLoad={handleLoad}
        />
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');

    it('should call the onLoad function', () => {
      assert.ok(handleLoad.calledOnce);

      assert.equal(handleLoad.args[0][0], 'bar');
      assert.containSubset(handleLoad.args[0][1], {
        initialValue: 'bar',
      });
      assert.instanceOf(handleLoad.args[0][2], window.HTMLInputElement);
      assert.equal(handleLoad.args[0][2], input);
    });
  });
});


describe('Extended Control components', () => {
  const inputControlElements = [
    '', // input with no type
    'text',
    'password',
    'number',
    'color',
  ];

  inputControlElements.forEach((type) => {
    describe(`with <Control.text> ${type ? `and type="${type}"` : ''}`, () => {
      const store = createTestStore({
        testForm: formReducer('test'),
        test: modelReducer('test', { foo: 'bar' }),
      });

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Control.text model="test.foo" type={type} />
        </Provider>
      );

      const node = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      it('should have an initial value from the model\'s initialState', () => {
        assert.equal(
          node.value,
          'bar');
      });

      it('should dispatch a focus event when focused', () => {
        TestUtils.Simulate.focus(node);

        assert.containSubset(
          store.getState().testForm.foo,
          { focus: true });
      });

      it('should dispatch a blur event when blurred', () => {
        TestUtils.Simulate.blur(node);

        assert.containSubset(
          store.getState().testForm.foo,
          { focus: false });
      });

      it('should dispatch a change event when changed', () => {
        node.value = 'testing';

        TestUtils.Simulate.change(node);

        assert.equal(
          store.getState().test.foo,
          'testing');

        node.value = 'testing again';

        TestUtils.Simulate.change(node);

        assert.equal(
          store.getState().test.foo,
          'testing again');
      });
    });
  });

  describe('with <Control.radio />', () => {
    const store = createTestStore({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: 'two' }),
    });

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <div>
          <Control.radio model="test.foo" value="one" />
          <Control.radio model="test.foo" value="two" />
        </div>
      </Provider>
    );

    const [radioOne, radioTwo] = TestUtils.scryRenderedDOMComponentsWithTag(field, 'input');

    it('should initially set the radio button matching the initial state to checked', () => {
      assert.equal(radioTwo.checked, true);
      assert.equal(radioOne.checked, false);
    });

    it('should give each radio input a name attribute of the model', () => {
      assert.equal(radioOne.name, 'test.foo');
      assert.equal(radioTwo.name, 'test.foo');
    });


    it('should dispatch a change event when changed', () => {
      TestUtils.Simulate.change(radioOne);

      assert.equal(
        store.getState().test.foo,
        'one');

      TestUtils.Simulate.change(radioTwo);

      assert.equal(
        store.getState().test.foo,
        'two');
    });

    it('should check the appropriate radio button when model is externally changed', () => {
      store.dispatch(actions.change('test.foo', 'one'));

      assert.equal(radioOne.checked, true);
      assert.equal(radioTwo.checked, false);

      store.dispatch(actions.change('test.foo', 'two'));

      assert.equal(radioTwo.checked, true);
      assert.equal(radioOne.checked, false);
    });

    it('should uncheck all radio buttons that are not equal to the value', () => {
      store.dispatch(actions.change('test.foo', 'three'));

      assert.equal(radioOne.checked, false);
      assert.equal(radioTwo.checked, false);
    });
  });
});
