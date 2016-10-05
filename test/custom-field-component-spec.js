/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import { assert } from 'chai';
import React, { Component, PropTypes } from 'react';
import TestUtils from 'react-addons-test-utils';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import { controls, createFieldClass, modelReducer, formReducer, Field } from '../src';

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

  CustomText.propTypes = { customOnChange: PropTypes.func };

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

  class CustomCheckbox extends Component {
    render() {
      const { onChange, value } = this.props;

      return (
        <span onClick={() => onChange(value)} />
      );
    }
  }

  CustomCheckbox.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.any,
  };

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
    MyCheckbox: controls.checkbox,
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

    class MyCheckbox extends React.Component {
      render() {
        return <div><input {...this.props} /></div>;
      }
    }

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <CustomField model="test.foo">
          <MyCheckbox type="checkbox" />
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

  it('should work with custom checkboxes', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: true }),
    }));

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <CustomField model="test.foo">
          <CustomCheckbox />
        </CustomField>
      </Provider>
    );

    const control = TestUtils.findRenderedDOMComponentWithTag(field, 'span');

    TestUtils.Simulate.click(control);

    assert.equal(
      store.getState().test.foo,
      false);
  });

  it('should work with custom checkboxes (multi)', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', { items: [1, 2, 3] }),
    }));

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <CustomField model="test.items[]">
          <CustomCheckbox value={1} />
          <CustomCheckbox value={2} />
          <CustomCheckbox value={3} />
        </CustomField>
      </Provider>
    );

    const fieldControls = TestUtils.scryRenderedDOMComponentsWithTag(field, 'span');

    assert.deepEqual(
      store.getState().test.items,
      [1, 2, 3]);

    TestUtils.Simulate.click(fieldControls[0]);

    assert.sameMembers(
      store.getState().test.items,
      [2, 3]);

    TestUtils.Simulate.click(fieldControls[1]);

    assert.sameMembers(
      store.getState().test.items,
      [3]);

    TestUtils.Simulate.click(fieldControls[0]);

    assert.sameMembers(
      store.getState().test.items,
      [1, 3]);
  });

  it('should pass event to asyncValidator', (done) => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: '' }),
    }));

    class TextInput extends React.Component {
      render() {
        return (
          <div>
            <input
              {...this.props}
              onChange={this.props.onChangeText}
            />
          </div>
        );
      }
    }

    TextInput.propTypes = {
      onChangeText: React.PropTypes.func,
    };

    const AsyncTestField = createFieldClass({
      TextInput: (props) => ({
        defaultValue: props.modelValue,
        onChangeText: props.onChange,
        onBlur: props.onBlur,
        onFocus: props.onFocus,
      }),
    }, {
      componentMap: {
        TextInput,
      },
    });

    const asyncIsUsernameInUse = (val) => new Promise((resolve) => {
      assert.equal(val, 'testing');
      resolve(false);
      done();
    });

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <AsyncTestField
          model={'test.foo'}
          asyncValidateOn="blur"
          asyncValidators={{
            usernameAvailable: (val, asyncDone) => asyncIsUsernameInUse(val)
              .then(inUse => asyncDone(!inUse))
              .catch(() => asyncDone(true)),
          }}
        >
          <TextInput />
        </AsyncTestField>
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');
    input.value = 'testing';
    TestUtils.Simulate.change(input);
    TestUtils.Simulate.blur(input);
  });
});
