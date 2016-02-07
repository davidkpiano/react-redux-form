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

import { Field, actions, createFormReducer, createModelReducer, initialFieldState } from '../lib';

describe('<Field /> component', () => {
  const textFieldElements = [
    ['input', 'text'],
    ['input', 'password'],
    ['input', 'number'],
    ['input', 'color'],
    ['textarea']
  ];

  it('should wrap child components in a <div> if more than one', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
        testForm: createFormReducer('test'),
        test: createModelReducer('test', { foo: 'bar' })
      }));
    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field model="test.foo">
          <label />
          <input />
        </Field>
      </Provider>
    );

    const div = TestUtils.findRenderedDOMComponentWithTag(field, 'div');

    assert.ok(div);

    assert.equal(
      div.props.children.length,
      2);
  });

  textFieldElements.map(([element, type]) => {
    describe(`with <${element} ${type ? 'type="' + type + '"' : ''}/>`, () => {
      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        testForm: createFormReducer('test'),
        test: createModelReducer('test', { foo: 'bar' })
      }));

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field model="test.foo">
            { React.createElement(element, { type }) }
          </Field>
        </Provider>
      );

      const node = TestUtils.findRenderedDOMComponentWithTag(field, element);

      it('should have an initial value from the model\'s initialState', () => {
        assert.equal(
          node.value,
          'bar');
      });

      it('should dispatch a focus event when focused', () => {    
        TestUtils.Simulate.focus(node);

        assert.containSubset(
          store.getState().testForm.fields['foo'],
          { focus: true, blur: false });
      });

      it('should dispatch a blur event when blurred', () => {    
        TestUtils.Simulate.blur(node);

        assert.containSubset(
          store.getState().testForm.fields['foo'],
          { focus: false, blur: true });
      });

      it('should dispatch a change event when changed', () => {
        node.value = 'testing';

        TestUtils.Simulate.change(node);

        assert.equal(
          store.getState().test.foo,
          'testing');
      });
    });

    describe(`with a controlled <${element} ${type ? 'type="' + type + '"' : ''} /> component`, () => {
      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        testForm: createFormReducer('test'),
        test: createModelReducer('test', { foo: 'bar' })
      }));

      const TestField = connect(s => s)((props) => {
        let { test } = props;

        return (
          <Field model="test.foo">
            { React.createElement(element, {
              type: type,
              value: test.foo
            }) }
          </Field>
        );
      });

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <TestField />
        </Provider>
      );

      const node = TestUtils.findRenderedDOMComponentWithTag(field, element);

      it('should have the initial value of the state', () => {
        assert.equal(
          node.value,
          'bar');
      });

      it('should update the value when the controlled input is changed', () => {
        TestUtils.Simulate.change(node, {
          target: { value: 'testing' }
        });

        assert.equal(
          node.value,
          'testing');
      });
    });
  });

  describe('with <input type="radio" />', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: createFormReducer('test'),
      test: createModelReducer('test', { foo: 'two' })
    }));

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field model="test.foo">
          <input type="radio" value="one" />
          <input type="radio" value="two" />
        </Field>
      </Provider>
    );

    const [ radioOne, radioTwo ] = TestUtils.scryRenderedDOMComponentsWithTag(field, 'input');

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

  describe('with <input type="checkbox" /> (single toggle)', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: createFormReducer('test'),
      test: createModelReducer('test', {
        foo: true
      })
    }));

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field model="test.foo">
          <input type="checkbox" />
        </Field>
      </Provider>
    );

    const checkbox = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    it('should initially set the checkbox to checked if the model is truthy', () => {
      assert.equal(checkbox.checked, true);
    });

    it('should give each radio input a name attribute of the model', () => {
      assert.equal(checkbox.name, 'test.foo');
    });


    it('should dispatch a change event when changed', () => {
      TestUtils.Simulate.change(checkbox);

      assert.equal(
        store.getState().test.foo,
        false);

      TestUtils.Simulate.change(checkbox);

      assert.equal(
        store.getState().test.foo,
        true);
    });

    it('should check/uncheck the checkbox when model is externally changed', () => {
      store.dispatch(actions.change('test.foo', true));

      assert.equal(checkbox.checked, true);

      store.dispatch(actions.change('test.foo', false));

      assert.equal(checkbox.checked, false);
    });

    it('should uncheck the checkbox for any falsey value', () => {
      store.dispatch(actions.change('test.foo', ''));

      assert.equal(checkbox.checked, false);
    });
  });

  describe('with <input type="checkbox" /> (multi toggle)', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: createFormReducer('test'),
      test: createModelReducer('test', {
        foo: [1]
      })
    }));

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field model="test.foo[]">
          <input type="checkbox" value={1} />
          <input type="checkbox" value={2} />
          <input type="checkbox" value={3} />
        </Field>
      </Provider>
    );

    const checkboxes = TestUtils.scryRenderedDOMComponentsWithTag(field, 'input');

    it('should initially set the checkbox to checked if the model is truthy', () => {
      assert.equal(checkboxes[0].checked, true);
    });

    it('should give each checkbox a name attribute of the model', () => {
      checkboxes.forEach((checkbox) => {
        assert.equal(checkbox.name, 'test.foo[]');
      })
    });

    it('should dispatch a change event when changed', () => {
      TestUtils.Simulate.change(checkboxes[0]);

      assert.sameMembers(
        store.getState().test.foo,
        []);

      TestUtils.Simulate.change(checkboxes[1]);

      assert.sameMembers(
        store.getState().test.foo,
        [2]);

      TestUtils.Simulate.change(checkboxes[0]);

      assert.sameMembers(
        store.getState().test.foo,
        [1, 2]);

      TestUtils.Simulate.change(checkboxes[2]);

      assert.sameMembers(
        store.getState().test.foo,
        [1, 2, 3]);

      TestUtils.Simulate.change(checkboxes[0]);

      assert.sameMembers(
        store.getState().test.foo,
        [2, 3]);
    });

    it('should check the appropriate checkboxes when model is externally changed', () => {
      store.dispatch(actions.change('test.foo', [1, 2]));

      assert.isTrue(checkboxes[0].checked);
      assert.isTrue(checkboxes[1].checked);
      assert.isFalse(checkboxes[2].checked);
    });
  });

  describe('with <select>', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: createFormReducer('test'),
      test: createModelReducer('test', {
        foo: "one"
      })
    }));

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field model="test.foo">
          <select>
            <option value="one" />
            <option value="two" />
            <option value="three" />
            <optgroup>
              <option value="four" />
              <option value="five" />
              <option value="six" />
            </optgroup>
          </select>
        </Field>
      </Provider>
    );

    const select = TestUtils.findRenderedDOMComponentWithTag(field, 'select');
    const options = TestUtils.scryRenderedDOMComponentsWithTag(field, 'option');

    it('should select the option that matches the initial state of the model', () => {
      assert.isTrue(options[0].selected);
      assert.isFalse(options[1].selected);
      assert.equal(select.value, 'one');
    });

    it('should dispatch a change event when changed', () => {
      TestUtils.Simulate.change(options[1]);

      assert.equal(
        store.getState().test.foo,
        'two');
    });

    it('should select the appropriate <option> when model is externally changed', () => {
      store.dispatch(actions.change('test.foo', 'three'));

      assert.isTrue(options[2].selected);
      assert.equal(select.value, 'three');
    });

    it('should work with <optgroup>', () => {
      TestUtils.Simulate.change(options[3]);

      assert.isTrue(options[3].selected);
      assert.equal(
        store.getState().test.foo,
        'four');
    });
  });

  describe('async validation property', () => {
    const formReducer = createFormReducer('test');
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
        testForm: formReducer,
        test: createModelReducer('test', {})
      }));


    it('should set the proper field state for a valid async validation', (done) => {
      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field model="test.foo"
            asyncValidators={{
              testValid: (val, done) => setTimeout(() => done(true), 10)
            }}
            asyncValidateOn="blur">
            <input type="text"/>
          </Field>
        </Provider>
      );

      const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');
      let expectedStates = [
        { blur: true },
        { pending: true, valid: true }, // initially valid
        { pending: true, valid: true }, // true after validating
        { pending: false, valid: true }
      ];

      let actualStates = [];

      store.subscribe(() => {
        let state = store.getState();

        actualStates.push(state.testForm.fields['foo']);

        if (actualStates.length == expectedStates.length) {
          expectedStates.map((expected, i) => {
            assert.containSubset(actualStates[i], expected, `${i}`);
          });

          done();
        }
      });

      TestUtils.Simulate.blur(control);
    });

    it('should set the proper field state for an invalid async validation', (done) => {
      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field model="test.foo"
            asyncValidators={{
              testValid: (val, done) => setTimeout(() => done(false), 10)
            }}
            asyncValidateOn="blur">
            <input type="text"/>
          </Field>
        </Provider>
      );

      const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');
      let expectedStates = [
        { blur: true },
        { pending: true, valid: true }, // initially valid
        { pending: true, valid: false }, // false after validating
        { pending: false, valid: false }
      ];

      let actualStates = [];

      store.subscribe(() => {
        let state = store.getState();

        actualStates.push(state.testForm.fields['foo']);

        if (actualStates.length == expectedStates.length) {
          expectedStates.map((expected, i) => {
            assert.containSubset(actualStates[i], expected, `${i}`);
          });

          done();
        }
      });

      TestUtils.Simulate.blur(control);
    });
  });
});

describe('<Field /> with custom components', () => {
  class CustomInput extends React.Component {
    static propTypes = {
      onChange: React.PropTypes.func
    };

    handleChange(val) {
      let { onChange } = this.props;

      return onChange(val.toUpperCase());
    }

    render() {
      return (
        <input type="text" onChange={(e) => this.handleChange(e.target.value)} />
      );
    }
  };

  class CustomRadio extends React.Component {
    static propTypes = {
      onChange: React.PropTypes.func
    };

    handleChange(val) {
      let { onChange } = this.props;

      return onChange(val);
    }

    render() {
      return (
        <input type="radio"
          onChange={(e) => this.handleChange(e.target.value)}
          value={ this.props.value }
          checked={ this.props.checked } />
      );
    }
  };

  class CustomCheckbox extends React.Component {
    static propTypes = {
      onChange: React.PropTypes.func
    };

    handleChange(val) {
      let { onChange } = this.props;

      return onChange(val);
    }

    render() {
      return (
        <input type="checkbox"
          onChange={(e) => this.handleChange(e.target.value)}
          value={ this.props.value }
          checked={ this.props.checked } />
      );
    }
  };

  const store = applyMiddleware(thunk)(createStore)(combineReducers({
    testForm: createFormReducer('test'),
    test: createModelReducer('test', {
      input: 'bar',
      radio: 'one',
      checkbox: ['check one']
    })
  }));

  it('should adapt to controls that implement the "onChange" prop', () => {
    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field model="test.input">
          <label />
          <CustomInput />
        </Field>
      </Provider>
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    TestUtils.Simulate.change(input, {
      target: { value: 'testing' }
    });

    assert.equal(
      store.getState().test.input,
      'TESTING');
  });

  it('should change the control implementation based on the "type" prop (radio)', () => {
    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field model="test.radio" type="radio">
          <label />
          <CustomRadio value="one" />
          <CustomRadio value="two" />
          <CustomRadio value="three" />
        </Field>
      </Provider>
    );

    const radios = TestUtils.scryRenderedDOMComponentsWithTag(field, 'input');

    assert.equal(
      store.getState().test.radio,
      'one');

    assert.equal(radios[0].checked, true);

    TestUtils.Simulate.change(radios[1]);

    assert.equal(
      store.getState().test.radio,
      'two');

    assert.equal(radios[0].checked, false);
    assert.equal(radios[1].checked, true);
  });

  it('should change the control implementation based on the "type" prop (checkbox)', () => {
    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field model="test.checkbox[]" type="checkbox">
          <label />
          <CustomCheckbox value="check one" />
          <CustomCheckbox value="check two" />
          <CustomCheckbox value="check three" />
        </Field>
      </Provider>
    );

    const checkboxes = TestUtils.scryRenderedDOMComponentsWithTag(field, 'input');

    assert.deepEqual(
      store.getState().test.checkbox,
      ['check one']);

    assert.equal(checkboxes[0].checked, true);

    TestUtils.Simulate.change(checkboxes[1]);

    assert.deepEqual(
      store.getState().test.checkbox,
      ['check one', 'check two']);

    assert.equal(checkboxes[0].checked, true);
    assert.equal(checkboxes[1].checked, true);

    TestUtils.Simulate.change(checkboxes[0]);

    assert.deepEqual(
      store.getState().test.checkbox,
      ['check two']);

    assert.equal(checkboxes[0].checked, false);
    assert.equal(checkboxes[1].checked, true);
  });
});


