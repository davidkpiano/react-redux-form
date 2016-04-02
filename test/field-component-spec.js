/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import React, { PropTypes } from 'react';
import { assert } from 'chai';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import thunk from 'redux-thunk';
import TestUtils from 'react-addons-test-utils';
import sinon from 'sinon';

import { Field, actions, formReducer, modelReducer } from '../src';

describe('<Field /> component', () => {
  const textFieldElements = [
    ['input', 'text'],
    ['input', 'password'],
    ['input', 'number'],
    ['input', 'color'],
    ['textarea'],
  ];

  it('should wrap child components in a <div> if more than one', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: 'bar' }),
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

  it('should not wrap child components in a <div> if only one', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      test: modelReducer('test', { foo: 'bar' }),
    }));
    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field model="test.foo">
          <input />
        </Field>
      </Provider>
    );

    assert.throws(() => {
      TestUtils.findRenderedDOMComponentWithTag(field, 'div');
    });

    assert.ok(TestUtils.findRenderedDOMComponentWithTag(field, 'input'));
  });

  it('should recursively handle nested control components', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      test: modelReducer('test', { foo: 'bar' }),
    }));

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field model="test.foo">
          <div>
            <label />
            <input />
          </div>
        </Field>
      </Provider>
    );

    const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    assert.equal(
      control.value,
      'bar',
      'should set control to initial value');

    control.value = 'testing';

    TestUtils.Simulate.change(control);

    assert.equal(
      store.getState().test.foo,
      'testing',
      'should update state when control is changed');
  });

  textFieldElements.map(([element, type]) => { // eslint-disable-line array-callback-return
    describe(`with <${element} ${type ? `type="${type}"` : ''}/>`, () => {
      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        testForm: formReducer('test'),
        test: modelReducer('test', { foo: 'bar' }),
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
          store.getState().testForm.fields.foo,
          { focus: true, blur: false });
      });

      it('should dispatch a blur event when blurred', () => {
        TestUtils.Simulate.blur(node);

        assert.containSubset(
          store.getState().testForm.fields.foo,
          { focus: false, blur: true });
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

    describe(`with a controlled <${element} ${type ? `type="${type}"` : ''} /> component`, () => {
      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        testForm: formReducer('test'),
        test: modelReducer('test', { foo: 'bar' }),
      }));

      const TestField = connect(s => s)(props => {
        const { test } = props;

        return (
          <Field model="test.foo">
            { React.createElement(element, {
              type,
              value: test.foo,
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
          target: { value: 'testing' },
        });

        assert.equal(
          node.value,
          'testing');
      });
    });
  });

  describe('with <input type="radio" />', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', { foo: 'two' }),
    }));

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field model="test.foo">
          <input type="radio" value="one" />
          <input type="radio" value="two" />
        </Field>
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

  describe('with <input type="checkbox" /> (single toggle)', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', {
        single: true,
      }),
    }));

    const field = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Field model="test.single">
          <input type="checkbox" />
        </Field>
      </Provider>
    );

    const checkbox = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

    it('should initially set the checkbox to checked if the model is truthy', () => {
      assert.equal(checkbox.checked, true);
    });

    it('should give each radio input a name attribute of the model', () => {
      assert.equal(checkbox.name, 'test.single');
    });


    it('should dispatch a change event when changed', () => {
      TestUtils.Simulate.change(checkbox);

      assert.equal(
        store.getState().test.single,
        false, 'false');

      TestUtils.Simulate.change(checkbox);

      assert.equal(
        store.getState().test.single,
        true, 'true');
    });

    it('should check/uncheck the checkbox when model is externally changed', () => {
      store.dispatch(actions.change('test.single', true));

      assert.equal(checkbox.checked, true);

      store.dispatch(actions.change('test.single', false));

      assert.equal(checkbox.checked, false);
    });

    it('should uncheck the checkbox for any falsey value', () => {
      store.dispatch(actions.change('test.single', ''));

      assert.equal(checkbox.checked, false);
    });
  });

  describe('with <input type="checkbox" /> (multi toggle)', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', {
        foo: [1],
      }),
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
      checkboxes.forEach(checkbox => {
        assert.equal(checkbox.name, 'test.foo[]');
      });
    });

    it('should dispatch a change event when changed', () => {
      TestUtils.Simulate.change(checkboxes[0]);

      assert.sameMembers(
        store.getState().test.foo,
        [], 'all unchecked');

      TestUtils.Simulate.change(checkboxes[1]);

      assert.sameMembers(
        store.getState().test.foo,
        [2], 'one checked');

      TestUtils.Simulate.change(checkboxes[0]);

      assert.sameMembers(
        store.getState().test.foo,
        [1, 2], 'two checked');

      TestUtils.Simulate.change(checkboxes[2]);

      assert.sameMembers(
        store.getState().test.foo,
        [1, 2, 3], 'all checked');

      TestUtils.Simulate.change(checkboxes[0]);

      assert.sameMembers(
        store.getState().test.foo,
        [2, 3], 'one unchecked');
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
      testForm: formReducer('test'),
      test: modelReducer('test', {
        foo: 'one',
      }),
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

  describe('validators and validateOn property', () => {
    const reducer = formReducer('test');
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: reducer,
      test: modelReducer('test', {}),
    }));

    it('should set the proper field state for validation', () => {
      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field
            model="test.foo"
            validators={{
              good: () => true,
              bad: () => false,
              custom: val => val !== 'invalid',
            }}
          >
            <input type="text" />
          </Field>
        </Provider>
      );

      const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      control.value = 'valid';

      TestUtils.Simulate.change(control);

      assert.deepEqual(
        store.getState().testForm.fields.foo.errors,
        {
          good: false,
          bad: true,
          custom: false,
        });

      control.value = 'invalid';

      TestUtils.Simulate.change(control);

      assert.deepEqual(
        store.getState().testForm.fields.foo.errors,
        {
          good: false,
          bad: true,
          custom: true,
        });
    });

    it('should validate on blur when validateOn prop is "blur"', () => {
      let timesValidationCalled = 0;

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field
            model="test.blur"
            validators={{
              good: () => true,
              bad: () => false,
              custom: (val) => {
                timesValidationCalled += 1;
                return val !== 'invalid';
              },
            }}
            validateOn="blur"
          >
            <input type="text" />
          </Field>
        </Provider>
      );

      const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      control.value = 'valid';

      assert.equal(timesValidationCalled, 1,
        'validation should only be called once upon load');

      TestUtils.Simulate.change(control);

      assert.equal(timesValidationCalled, 1,
        'validation should not be called upon change');

      TestUtils.Simulate.blur(control);

      assert.equal(timesValidationCalled, 2,
        'validation should be called upon blur');

      assert.deepEqual(
        store.getState().testForm.fields.blur.errors,
        {
          good: false,
          bad: true,
          custom: false,
        }, 'should only validate upon blur');
    });

    it('should send the proper model value to the validators', () => {
      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field
            model="test.items[]"
            validators={{
              required: (val) => val && val.length,
              values: (val) => val,
            }}
          >
            <input type="checkbox" value="first" />
            <input type="checkbox" value="second" />
          </Field>
        </Provider>
      );

      const checkboxes = TestUtils.scryRenderedDOMComponentsWithTag(field, 'input');

      assert.isFalse(store.getState().testForm.fields.items.valid);

      TestUtils.Simulate.change(checkboxes[0]);

      assert.isTrue(store.getState().testForm.fields.items.valid);
      assert.equal(
        store.getState().testForm.fields.items.validity.required,
        1);

      TestUtils.Simulate.change(checkboxes[1]);
      assert.equal(
        store.getState().testForm.fields.items.validity.required,
        2);
      assert.deepEqual(
        store.getState().testForm.fields.items.validity.values,
        ['first', 'second']);

      TestUtils.Simulate.change(checkboxes[0]);
      assert.equal(
        store.getState().testForm.fields.items.validity.required,
        1);
      assert.deepEqual(
        store.getState().testForm.fields.items.validity.values,
        ['second']);

      TestUtils.Simulate.change(checkboxes[1]);
      assert.equal(
        store.getState().testForm.fields.items.validity.required,
        0);
      assert.isFalse(store.getState().testForm.fields.items.valid);
    });
  });

  describe('asyncValidators and asyncValidateOn property', () => {
    const reducer = formReducer('test');
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: reducer,
      test: modelReducer('test', {}),
    }));

    it('should set the proper field state for a valid async validation', done => {
      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field
            model="test.foo"
            asyncValidators={{
              testValid: (val, _done) => setTimeout(() => _done(true), 10),
            }}
            asyncValidateOn="blur"
          >
            <input type="text" />
          </Field>
        </Provider>
      );

      const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');
      const expectedStates = [
        { blur: true },
        { pending: true, valid: true }, // initially valid
        { pending: true, valid: true }, // true after validating
        { pending: false, valid: true },
      ];

      const actualStates = [];

      store.subscribe(() => {
        const state = store.getState();

        actualStates.push(state.testForm.fields.foo);

        if (actualStates.length === expectedStates.length) {
          expectedStates.map((expected, i) =>
            assert.containSubset(actualStates[i], expected, `${i}`)
          );

          done();
        }
      });

      TestUtils.Simulate.blur(control);
    });

    it('should set the proper field state for an invalid async validation', done => {
      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field
            model="test.foo"
            asyncValidators={{
              testValid: (val, _done) => setTimeout(() => _done(false), 10),
            }}
            asyncValidateOn="blur"
          >
            <input type="text" />
          </Field>
        </Provider>
      );

      const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');
      const expectedStates = [
        { blur: true },
        { pending: true, valid: true }, // initially valid
        { pending: true, valid: false }, // false after validating
        { pending: false, valid: false },
      ];

      const actualStates = [];

      store.subscribe(() => {
        const state = store.getState();

        actualStates.push(state.testForm.fields.foo);

        if (actualStates.length === expectedStates.length) {
          expectedStates.map((expected, i) =>
            assert.containSubset(actualStates[i], expected, `${i}`)
          );

          done();
        }
      });

      TestUtils.Simulate.blur(control);
    });
  });

  describe('errors property', () => {
    const reducer = formReducer('test');


    it('should set the proper field state for errors', () => {
      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        testForm: reducer,
        test: modelReducer('test', {
          foo: '',
        }),
      }));

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field
            model="test.foo"
            errors={{
              length: (val) => val.length > 8 && 'too long',
              valid: (val) => val !== 'valid' && 'not valid',
            }}
          >
            <input type="text" />
          </Field>
        </Provider>
      );

      const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      control.value = 'valid';

      TestUtils.Simulate.change(control);

      assert.deepEqual(
        store.getState().testForm.fields.foo.errors,
        {
          length: false,
          valid: false,
        });

      control.value = 'invalid string';

      TestUtils.Simulate.change(control);

      assert.deepEqual(
        store.getState().testForm.fields.foo.errors,
        {
          length: 'too long',
          valid: 'not valid',
        });
    });

    it('should only validate errors on blur if validateOn="blur"', () => {
      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        testForm: reducer,
        test: modelReducer('test', {
          foo: '',
        }),
      }));

      let timesValidationCalled = 0;

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field
            model="test.foo"
            errors={{
              length: (val) => val.length > 8 && 'too long',
              valid: (val) => {
                timesValidationCalled += 1;
                return val !== 'valid' && 'not valid';
              },
            }}
            validateOn="blur"
          >
            <input type="text" required />
          </Field>
        </Provider>
      );

      const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      assert.equal(timesValidationCalled, 1,
        'validation should be called on load');

      control.value = 'valid';

      TestUtils.Simulate.change(control);

      assert.equal(timesValidationCalled, 1,
        'validation should not be called again on change');

      TestUtils.Simulate.blur(control);

      assert.equal(timesValidationCalled, 2,
        'validation should be called again on blur');

      assert.deepEqual(
        store.getState().testForm.fields.foo.errors,
        {
          length: false,
          valid: false,
        });

      control.value = 'invalid string';

      TestUtils.Simulate.change(control);

      assert.deepEqual(
        store.getState().testForm.fields.foo.errors,
        {
          length: false,
          valid: false,
        });

      TestUtils.Simulate.blur(control);

      assert.deepEqual(
        store.getState().testForm.fields.foo.errors,
        {
          length: 'too long',
          valid: 'not valid',
        });
    });
  });

  describe('dynamic components', () => {
    const reducer = formReducer('test');
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: reducer,
      test: modelReducer('test', {}),
    }));

    class DynamicSelectForm extends React.Component {
      constructor() {
        super();

        this.state = { options: [1, 2] };
      }

      render() {
        return (
          <div>
            <button onClick={() => this.setState({ options: [1, 2, 3] })} />
            <Field model="test.foo">
              <select>
                { this.state.options.map((option, i) =>
                  <option key={i} value={ option } />
                )}
              </select>
            </Field>
          </div>
        );
      }
    }

    it('should properly update dynamic components inside <Field>', () => {
      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <DynamicSelectForm />
        </Provider>
      );

      let options = TestUtils.scryRenderedDOMComponentsWithTag(field, 'option');
      const button = TestUtils.findRenderedDOMComponentWithTag(field, 'button');

      assert.equal(options.length, 2);

      TestUtils.Simulate.click(button);

      options = TestUtils.scryRenderedDOMComponentsWithTag(field, 'option');

      assert.equal(options.length, 3);
    });
  });

  describe('wrapper components with component property', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      test: modelReducer('test', {}),
    }));

    it('should wrap children with specified component (string)', () => {
      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field component="div">
            <input type="text" />
          </Field>
        </Provider>
      );

      const wrapper = TestUtils.findRenderedDOMComponentWithTag(field, 'div');

      assert.ok(wrapper);
    });

    it('should wrap children with specified component (class)', () => {
      class Wrapper extends React.Component {
        render() {
          return <main className="wrapper">{ this.props.children }</main>;
        }
      }

      Wrapper.propTypes = { children: PropTypes.object };

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field component={Wrapper}>
            <input type="text" />
          </Field>
        </Provider>
      );

      const wrapper = TestUtils.findRenderedDOMComponentWithClass(field, 'wrapper');

      assert.ok(wrapper);
    });

    it('should wrap children with specified component (function)', () => {
      /* eslint-disable react/prop-types */
      function Wrapper(props) {
        return <section className="wrapper">{props.children}</section>;
      }
      /* eslint-enable react/prop-types */

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field component={Wrapper}>
            <input type="text" />
          </Field>
        </Provider>
      );

      const wrapper = TestUtils.findRenderedDOMComponentWithClass(field, 'wrapper');

      assert.ok(wrapper);
    });

    it('should wrap children with a <div> when provided with className', () => {
      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field className="wrapper">
            <input type="text" />
          </Field>
        </Provider>
      );

      const wrapper = TestUtils.findRenderedDOMComponentWithClass(field, 'wrapper');

      assert.ok(wrapper);
    });
  });

  describe('updateOn prop', () => {
    const onEvents = [
      'change',
      'focus',
      'blur',
    ];

    onEvents.forEach((onEvent) => {
      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        test: modelReducer('test', { foo: 'initial' }),
      }));

      it(`should update the store when updateOn="${onEvent}"`, () => {
        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Field model="test.foo"
              updateOn={ onEvent }
            >
              <input type="text" />
            </Field>
          </Provider>
        );

        const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

        assert.equal(store.getState().test.foo, 'initial');

        const testValue = `${onEvent} test`;

        control.value = testValue;

        assert.equal(store.getState().test.foo, 'initial',
          'Model value should not change yet');

        TestUtils.Simulate[onEvent](control);

        assert.equal(store.getState().test.foo, testValue);
      });
    });

    it('should decorate the "change" action with a provided decorator', () => {
      let decoratorCalled = false;

      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        test: modelReducer('test', { foo: 'initial' }),
      }));

      const changeDecorator = (change) => (val) => {
        decoratorCalled = true;

        return change(val);
      };

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field model="test.foo"
            updateOn={ changeDecorator }
          >
            <input type="text" />
          </Field>
        </Provider>
      );

      const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      assert.equal(store.getState().test.foo, 'initial');

      control.value = 'decorator test';

      assert.equal(store.getState().test.foo, 'initial',
        'Model value should not change yet');

      TestUtils.Simulate.change(control);

      assert.equal(store.getState().test.foo, 'decorator test');

      assert.isTrue(decoratorCalled);
    });
  });

  describe('validation on load', () => {
    const reducer = formReducer('test');
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: reducer,
      test: modelReducer('test', {
        foo: 'invalid',
      }),
    }));

    it('should always validate the model initially', () => {
      TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field
            model="test.foo"
            validators={{
              initial: (val) => val !== 'invalid',
            }}
          >
            <input type="text" />
          </Field>
        </Provider>
      );

      assert.containSubset(
        store.getState().testForm.fields.foo,
        {
          valid: false,
          validity: {
            initial: false,
          },
          errors: {
            initial: true,
          },
        });
    });
  });

  describe('syncing control defaultValue on load', () => {
    const reducer = modelReducer('test');
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      test: reducer,
    }));

    it('should change the model to the defaultValue on load', () => {
      TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field
            model="test.foo"
          >
            <input type="text" defaultValue="testing" />
          </Field>
        </Provider>
      );

      assert.equal(
        store.getState().test.foo,
        'testing');
    });
  });

  describe('change on enter', () => {
    const reducer = modelReducer('test');
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      test: reducer,
    }));

    it('should change the model upon pressing Enter', () => {
      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field
            model="test.foo"
            updateOn="blur"
          >
            <input type="text" />
          </Field>
        </Provider>
      );

      const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      control.value = 'testing';

      TestUtils.Simulate.keyPress(control, {
        key: 'Enter',
        keyCode: 13,
        which: 13,
      });

      assert.equal(
        store.getState().test.foo,
        'testing');
    });
  });

  describe('changeAction prop', () => {
    const reducer = modelReducer('test');
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      test: reducer,
    }));

    it('should execute the custom change action', () => {
      let customChanged = false;

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field
            model="test.foo"
            changeAction={(model, value) => {
              customChanged = true;
              return actions.change(model, value);
            }}
          >
            <input type="text" />
          </Field>
        </Provider>
      );

      const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      control.value = 'testing';

      TestUtils.Simulate.change(control);

      assert.isTrue(customChanged);

      assert.equal(
        store.getState().test.foo,
        'testing');
    });
  });

  describe('event handlers on control', () => {
    const reducer = modelReducer('test');
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      test: reducer,
    }));

    it('should execute the custom change action', () => {
      const onChangeFn = (val) => val;
      const onChangeFnSpy = sinon.spy(onChangeFn);

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field
            model="test.foo"
          >
            <input type="text" onChange={onChangeFnSpy} />
          </Field>
        </Provider>
      );

      const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      control.value = 'testing';

      TestUtils.Simulate.change(control);

      assert.isTrue(onChangeFnSpy.calledOnce);
      assert.isObject(onChangeFnSpy.returnValues[0]);
      assert.equal(
        onChangeFnSpy.returnValues[0].constructor.name,
        'SyntheticEvent');
      assert.equal(
        onChangeFnSpy.returnValues[0].target.value,
        'testing');
    });

    it('should persist and return the event even when not returned', () => {
      const onChangeFn = () => {};
      const onChangeFnSpy = sinon.spy(onChangeFn);

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field
            model="test.foo"
          >
            <input type="text" onChange={onChangeFnSpy} />
          </Field>
        </Provider>
      );

      const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      control.value = 'testing 2';

      TestUtils.Simulate.change(control);

      assert.isTrue(onChangeFnSpy.calledOnce);
      assert.isUndefined(onChangeFnSpy.returnValues[0]);
      assert.equal(
        store.getState().test.foo,
        'testing 2');
    });
  });
});
