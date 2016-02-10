import React from 'react';
import chai from 'chai';
import chaiSubset from 'chai-subset';
import should from 'should';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import thunk from 'redux-thunk';
import TestUtils from 'react-addons-test-utils';

chai.use(chaiSubset);

const { assert } = chai;

import { Input } from 'react-bootstrap';

import { Field, createFieldClass, actions, createFormReducer, createModelReducer, initialFieldState } from '../lib';

describe('<Field /> components with react-bootstrap', () => {
  const BSField = createFieldClass({
    'Input': 'input'
  });

  const store = applyMiddleware(thunk)(createStore)(combineReducers({
    testForm: createFormReducer('test'),
    test: createModelReducer('test', {
      input: 'bar',
      radio: 'two',
      checkbox: ['check one']
    })
  }));

  const textInputTypes = [
    'text',
    'password',
    'email',
    'number',
    'color'
  ];

  textInputTypes.map((textInputType) => {  
    it(`should work with <Input type="${textInputType} />`, () => {
      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <BSField model="test.input">
            <Input type={ textInputType } />
          </BSField>
        </Provider>
      );

      const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      TestUtils.Simulate.change(input, {
        target: { value: 'testing' }
      });

      assert.equal(
        store.getState().test.input,
        'testing')
    });
  });

  describe('<Input type="radio" />', () => {
    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <BSField model="test.radio">
          <Input type="radio" value="one" />
          <Input type="radio" value="two" />
        </BSField>
      </Provider>
    );

    const radios = TestUtils.scryRenderedDOMComponentsWithTag(field, 'input');

    it('should initially set the radio button matching the initial state to checked', () => {
      assert.equal(radios[1].checked, true);
      assert.equal(radios[0].checked, false);
    });

    it('should give each radio input a name attribute of the model', () => {
      assert.equal(radios[0].name, 'test.radio');
      assert.equal(radios[1].name, 'test.radio');
    });


    it('should dispatch a change event when changed', () => {
      TestUtils.Simulate.change(radios[0]);

      assert.equal(
        store.getState().test.radio,
        'one');

      TestUtils.Simulate.change(radios[1]);

      assert.equal(
        store.getState().test.radio,
        'two');
    });

    it('should check the appropriate radio button when model is externally changed', () => {
      store.dispatch(actions.change('test.radio', 'one'));

      assert.equal(radios[0].checked, true);
      assert.equal(radios[1].checked, false);

      store.dispatch(actions.change('test.radio', 'two'));

      assert.equal(radios[1].checked, true);
      assert.equal(radios[0].checked, false);
    });

    it('should uncheck all radio buttons that are not equal to the value', () => {
      store.dispatch(actions.change('test.radio', 'three'));

      assert.equal(radios[0].checked, false);
      assert.equal(radios[1].checked, false);
    });
  });
});
