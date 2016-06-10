/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import { assert } from 'chai';
import React, { Component, PropTypes } from 'react';
import TestUtils from 'react-addons-test-utils';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import {
  Field as NativeField,
  Form as NativeForm,
} from '../src/native';
import { controls, createFieldClass, formReducer, modelReducer, Field } from '../src';

describe('controls props mapping', () => {
  it('should exist', () => {
    assert.ok(controls);
  });
});

describe('createFieldClass()', () => {
  it('should exist as a function', () => {
    assert.isFunction(createFieldClass);
  });
});

describe('custom <Field /> components with createFieldClass()', () => {
  class CustomText extends Component {
    handleChange(e) {
      const { customOnChange } = this.props;
      const value = e.target.value.toUpperCase();

      customOnChange(value);
    }

    render() {
      return (
        <div>
          <input onChange={e => this.handleChange(e)} />
        </div>
      );
    }
  }

  CustomText.propTypes = { customOnChange: PropTypes.function };


  class FamiliarText extends Component {
    render() {
      const { onChange } = this.props;

      return (
        <div>
          <input onChange={e => onChange(e)} />
        </div>
      );
    }
  }

  FamiliarText.propTypes = { onChange: PropTypes.function };

  const MinifiedText = class MT extends Component {
    render() {
      const { onChange } = this.props;

      return (
        <div>
          <input onChange={e => onChange(e)} />
        </div>
      );
    }
  };

  MinifiedText.propTypes = { onChange: PropTypes.function };

  const CustomField = createFieldClass({
    CustomText: props => ({
      customOnChange: props.onChange,
    }),
    FamiliarText: controls.text,
    CustomCheckbox: controls.checkbox,
    MinifiedText: {
      ...controls.text,
      component: MinifiedText,
    },
  });

  it('should return a Field component class', () => {
    assert.equal(CustomField.constructor, Field.constructor);
  });

  it('should handle custom prop mappings', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: 'bar' }),
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
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: 'bar' }),
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
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: 'bar' }),
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

  it('should work with mapping appropriate change actions with type="..."', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: 'bar' }),
    }));

    class CustomCheckbox extends React.Component {
      render() {
        return <div><input {...this.props} /></div>;
      }
    }

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <CustomField model="test.foo">
          <CustomCheckbox type="checkbox" />
        </CustomField>
      </Provider>
    );

    const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    assert.equal(control.checked, true);

    TestUtils.Simulate.change(control);

    assert.equal(control.checked, false);

    assert.equal(
      store.getState().test.foo,
      false);

    TestUtils.Simulate.change(control);

    assert.equal(control.checked, true);

    assert.equal(
      store.getState().test.foo,
      true);
  });

  it('should work with minified components (no displayName)', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: 'bar' }),
    }));

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <CustomField model="test.foo">
          <MinifiedText />
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

describe('React Native <Field /> components', () => {
  it('should exist', () => {
    assert.ok(NativeField);
  });

  it('should map the native field component', () => {
    // Placeholder div, for now
    class TextField extends Component {
      render() {
        return <div />;
      }
    }

    assert.ok(<NativeField model="foo.bar"><TextField /></NativeField>);
  });

  it('should render a Form component as a View', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: 'bar' }),
    }));

    const form = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <NativeForm model="test" />
      </Provider>
    );

    // Placeholder div, for now
    const formElement = TestUtils.findRenderedDOMComponentWithTag(form, 'div');

    assert.ok(formElement);
  });
});
