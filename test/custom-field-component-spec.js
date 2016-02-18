import React from 'react';
import chai from 'chai';
import chaiSubset from 'chai-subset';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import thunk from 'redux-thunk';
import TestUtils from 'react-addons-test-utils';

chai.use(chaiSubset);

const { assert } = chai;

import {
  Field,
  createFieldClass,
  actions,
  createFormReducer,
  createModelReducer,
  controls
} from '../lib';

describe('controls props mapping', () => {
  it('should exist', () => {
    assert.ok(controls);
  });
});

describe('createFieldClass()', () => {
  it('should exist as a function', () => {
    assert.isFunction(createFieldClass);
  });
})

describe('custom <Field /> components with createFieldClass()', () => {
  const CustomField = createFieldClass({
    'CustomText': (props) => ({
      customOnChange: props.onChange
    }),
    'FamiliarText': controls.text
  });

  class CustomText extends React.Component {
    handleChange(e) {
      let { customOnChange } = this.props;
      let value = e.target.value.toUpperCase();

      customOnChange(value);
    }
    render() {
      let { customOnChange } = this.props;

      return (
        <div>
          <input onChange={(e) => this.handleChange(e)} />
        </div>
      );
    }
  }

  class FamiliarText extends React.Component {
    render() {
      let { onChange } = this.props;

      return (
        <div>
          <input onChange={(e) => onChange(e)} />
        </div>
      )
    }
  }

  it('should return a Field component class', () => {
    assert.equal(CustomField.constructor, Field.constructor);
  });

  it('should handle custom prop mappings', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: createFormReducer('test'),
      test: createModelReducer('test', { foo: 'bar' })
    }));

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <CustomField model="test.foo">
          <CustomText />
        </CustomField>
      </Provider>
    );

    const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    control.value = 'testing';

    TestUtils.Simulate.change(control);

    assert.equal(
      store.getState().test.foo,
      'TESTING');
  });

  it('should handle string prop mappings', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: createFormReducer('test'),
      test: createModelReducer('test', { foo: 'bar' })
    }));

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <CustomField model="test.foo">
          <FamiliarText />
        </CustomField>
      </Provider>
    );

    const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    control.value = 'testing';

    TestUtils.Simulate.change(control);

    assert.equal(
      store.getState().test.foo,
      'testing');
  });

  it('should continue to recognize native controls', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: createFormReducer('test'),
      test: createModelReducer('test', { foo: 'bar' })
    }));

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <CustomField model="test.foo">
          <input type="text" />
        </CustomField>
      </Provider>
    );

    const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    control.value = 'testing';

    TestUtils.Simulate.change(control);

    assert.equal(
      store.getState().test.foo,
      'testing');
  });
});
