/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import { assert } from 'chai';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TestUtils from 'react-dom/test-utils';
import { Provider } from 'react-redux';

import { modelReducer, formReducer, Control } from '../src';
import { testCreateStore } from './utils';

describe('custom <Control /> components', () => {
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

  FamiliarText.propTypes = { onChange: PropTypes.func };

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

  MinifiedText.propTypes = { onChange: PropTypes.func };

  it('should handle custom prop mappings', () => {
    const store = testCreateStore({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: 'bar' }),
    });

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Control
          model="test.foo"
          component={CustomText}
          mapProps={{
            customOnChange: (props) => props.onChange,
          }}
        />
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
    const store = testCreateStore({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: 'bar' }),
    });

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Control.text
          model="test.foo"
          component={FamiliarText}
        />
      </Provider>
    );

    const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    control.value = 'testing';

    TestUtils.Simulate.change(control);

    assert.equal(
      store.getState().test.foo,
      'testing');
  });

  it('should work with minified components (no displayName)', () => {
    const store = testCreateStore({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: 'bar' }),
    });

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Control.text
          model="test.foo"
          component={MinifiedText}
        />
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
    const store = testCreateStore({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: true }),
    });

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Control.checkbox
          model="test.foo"
          component={CustomCheckbox}
        />
      </Provider>
    );

    const control = TestUtils.findRenderedDOMComponentWithTag(field, 'span');

    TestUtils.Simulate.click(control);

    assert.equal(
      store.getState().test.foo,
      false);
  });

  it('should work with custom checkboxes (multi)', () => {
    const store = testCreateStore({
      testForm: formReducer('test'),
      test: modelReducer('test', { items: [1, 2, 3] }),
    });

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <div>
          <Control.checkbox
            model="test.items[]"
            value={1}
            component={CustomCheckbox}
          />
          <Control.checkbox
            model="test.items[]"
            value={2}
            component={CustomCheckbox}
          />
          <Control.checkbox
            model="test.items[]"
            value={3}
            component={CustomCheckbox}
          />
        </div>
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
    const store = testCreateStore({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: '' }),
    });

    class TextInput extends React.Component {
      render() {
        /* eslint-disable no-unused-vars */
        const { onChangeText, defaultValue, focus, touched, ...otherProps } = this.props;
        /* eslint-enable */
        return (
          <div>
            <input
              {...otherProps}
              onChange={onChangeText}
            />
          </div>
        );
      }
    }

    TextInput.propTypes = {
      onChangeText: PropTypes.func,
      defaultValue: PropTypes.string,
      focus: PropTypes.bool,
      touched: PropTypes.bool,
    };

    const mapProps = {
      defaultValue: (props) => props.modelValue,
      onChangeText: (props) => props.onChange,
      onBlur: (props) => props.onBlur,
      onFocus: (props) => props.onFocus,
    };

    const asyncIsUsernameInUse = (val) => new Promise((resolve) => {
      assert.equal(val, 'testing');
      resolve(false);
      done();
    });

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Control
          model="test.foo"
          component={TextInput}
          mapProps={mapProps}
          asyncValidateOn="blur"
          asyncValidators={{
            usernameAvailable: (val, asyncDone) => asyncIsUsernameInUse(val)
              .then(inUse => asyncDone(!inUse))
              .catch(() => asyncDone(true)),
          }}
        />
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');
    input.value = 'testing';

    TestUtils.Simulate.change(input);
    TestUtils.Simulate.blur(input);
  });

  it('should pass fieldValue in mapProps', () => {
    const store = testCreateStore({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: '' }),
    });

    class TextInput extends React.Component {
      render() {
        const { focus, touched, ...otherProps } = this.props;
        const className = [
          focus ? 'focus' : '',
          touched ? 'touched' : '',
        ].join(' ');

        return (
          <div>
            <input
              className={className}
              {...otherProps}
              onChange={this.props.onChangeText}
            />
          </div>
        );
      }
    }

    TextInput.propTypes = {
      onChangeText: PropTypes.func,
      focus: PropTypes.bool,
      touched: PropTypes.bool,
    };

    const mapProps = {
      onChange: (props) => props.onChange,
      onBlur: (props) => props.onBlur,
      onFocus: (props) => props.onFocus,
      focus: ({ fieldValue }) => fieldValue.focus,
      touched: ({ fieldValue }) => fieldValue.touched,
    };

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Control
          model="test.foo"
          component={TextInput}
          mapProps={mapProps}
        />
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    TestUtils.Simulate.focus(input);

    assert.equal(input.className.trim(), 'focus');

    TestUtils.Simulate.blur(input);

    assert.equal(input.className.trim(), 'touched');
  });

  it('should not pass default mapped props to custom controls', (done) => {
    const store = testCreateStore({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: 'bar' }),
    });

    const CustomControl = (props) => {
      assert.notProperty(props, 'onChange');
      done();

      return null;
    };

    TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Control.custom
          model="test.foo"
          component={CustomControl}
        />
      </Provider>
    );
  });
});
