/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { assert } from 'chai';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import TestUtils from 'react-dom/test-utils';
import capitalize from 'lodash/capitalize';
import mapValues from 'lodash/mapValues';
import _get from 'lodash.get';
import toPath from 'lodash.topath';
import sinon from 'sinon';
import createTestStore from 'redux-test-store';
import { testCreateStore, testRender } from './utils';
import Immutable from 'immutable';

import {
  Field as _Field,
  actions as _actions,
  actionTypes,
  modelReducer as _modelReducer,
  formReducer as _formReducer,
  controls,
} from '../src';
import {
  Field as ImmutableField,
  actions as immutableActions,
  modelReducer as immutableModelReducer,
  formReducer as immutableFormReducer,
} from '../immutable';
import isValid from '../src/form/is-valid';

const testContexts = {
  standard: {
    Field: _Field,
    actions: _actions,
    modelReducer: _modelReducer,
    formReducer: _formReducer,
    get: _get,
    length: (value) => value.length,
  },
  immutable: {
    Field: ImmutableField,
    actions: immutableActions,
    modelReducer: (model, initialState) =>
      immutableModelReducer(model, Immutable.fromJS(initialState)),
    formReducer: immutableFormReducer,
    get: (value, path) => {
      const result = value.getIn(toPath(path));
      try {
        return result.toJS();
      } catch (e) {
        return result;
      }
    },
    length: (value) => value.size,
  },
};

Object.keys(testContexts).forEach((testKey) => {
  const testContext = testContexts[testKey];
  const Field = testContext.Field;
  const actions = testContext.actions;
  const modelReducer = testContext.modelReducer;
  const formReducer = testContext.formReducer;
  const get = testContext.get;
  const length = testContext.length;

  describe('<Field /> component', () => {
    const textFieldElements = [
      ['input', 'text'],
      ['input', 'password'],
      ['input', 'number'],
      ['input', 'color'],
      ['textarea'],
    ];

    it('should wrap child components in a <div> if more than one', () => {
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', { foo: 'bar' }),
      });
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
        div.childNodes.length,
        2);
    });

    it('should wrap child components in a <div> even if only one child', () => {
      const store = testCreateStore({
        test: modelReducer('test', { foo: 'bar' }),
        testForm: formReducer('test'),
      });
      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field model="test.foo">
            <input />
          </Field>
        </Provider>
      );

      assert.ok(TestUtils.findRenderedDOMComponentWithTag(field, 'div'));

      assert.ok(TestUtils.findRenderedDOMComponentWithTag(field, 'input'));
    });

    it('should not wrap child components if only one child and null component', () => {
      const store = testCreateStore({
        test: modelReducer('test', { foo: 'bar' }),
        testForm: formReducer('test'),
      });
      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field model="test.foo" component={null}>
            <input />
          </Field>
        </Provider>
      );

      assert.throws(() => TestUtils.findRenderedDOMComponentWithTag(field, 'div'));

      assert.ok(TestUtils.findRenderedDOMComponentWithTag(field, 'input'));
    });

    it('should recursively handle nested control components', () => {
      const store = testCreateStore({
        test: modelReducer('test', { foo: 'bar' }),
        testForm: formReducer('test'),
      });

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
        get(store.getState().test, 'foo'),
        'testing',
        'should update state when control is changed');
    });

    it('should handle nested control components created with React.Children.only', () => {
      const store = testCreateStore({
        test: modelReducer('test', { foo: 'bar' }),
        testForm: formReducer('test'),
      });

      class ChildOnlyComp extends React.Component {
        render() {
          const child = React.Children.only(this.props.children);

          return (
            <div>
              {child}
            </div>
          );
        }
      }

      ChildOnlyComp.propTypes = {
        children: PropTypes.node,
      };

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field model="test.foo">
            <ChildOnlyComp>
              <input />
            </ChildOnlyComp>
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
        get(store.getState().test, 'foo'),
        'testing',
        'should update state when control is changed');
    });

    it('should bypass null/falsey children', () => {
      assert.doesNotThrow(() => {
        const store = testCreateStore({
          test: modelReducer('test', { foo: 'bar' }),
          testForm: formReducer('test'),
        });

        TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Field model="test.foo">
              <input />
              <div>{false}</div>
            </Field>
          </Provider>
        );
      });
    });

    textFieldElements.forEach(([element, type]) => {
      describe(`with <${element} ${type ? `type="${type}"` : ''}/>`, () => {
        const store = testCreateStore({
          testForm: formReducer('test'),
          test: modelReducer('test', { foo: 'bar' }),
        });

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Field model="test.foo">
              {React.createElement(element, { type })}
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
            get(store.getState().test, 'foo'),
            'testing');

          node.value = 'testing again';

          TestUtils.Simulate.change(node);

          assert.equal(
            get(store.getState().test, 'foo'),
            'testing again');
        });

        it('should have the appropriate type attribute', () => {
          assert.equal(node.getAttribute('type'), type);
        });
      });

      describe(`with a controlled <${element} ${type ? `type="${type}"` : ''} /> component`, () => {
        const store = testCreateStore({
          testForm: formReducer('test'),
          test: modelReducer('test', { foo: 'bar' }),
        });

        const TestField = connect(s => s)(props => {
          const { test } = props;

          return (
            <Field model="test.foo">
              {React.createElement(element, {
                type,
                value: get(test, 'foo'),
              })}
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
      const fields = {
        deep: <Field model="test.foo">
          <label>
            <input type="radio" value="one" />
          </label>
          <label>
            <input type="radio" value="two" />
          </label>
        </Field>,
        shallow: <Field model="test.foo">
          <input type="radio" value="one" />
          <input type="radio" value="two" />
        </Field>,
      };

      mapValues(fields, (fieldChild, key) => {
        describe(`type: ${key}`, () => {
          const store = testCreateStore({
            testForm: formReducer('test'),
            test: modelReducer('test', { foo: 'two' }),
          });

          const field = TestUtils.renderIntoDocument(
            <Provider store={store}>
              {fieldChild}
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
              get(store.getState().test, 'foo'),
              'one');

            TestUtils.Simulate.change(radioTwo);

            assert.equal(
              get(store.getState().test, 'foo'),
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
    });

    describe('with <input type="checkbox" /> (single toggle)', () => {
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', {
          single: true,
        }),
      });

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
          get(store.getState().test, 'single'),
          false, 'false');

        TestUtils.Simulate.change(checkbox);

        assert.equal(
          get(store.getState().test, 'single'),
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
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', {
          foo: [1],
        }),
      });

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
          get(store.getState().test, 'foo'),
          [], 'all unchecked');

        TestUtils.Simulate.change(checkboxes[1]);

        assert.sameMembers(
          get(store.getState().test, 'foo'),
          [2], 'one checked');

        TestUtils.Simulate.change(checkboxes[0]);

        assert.sameMembers(
          get(store.getState().test, 'foo'),
          [1, 2], 'two checked');

        TestUtils.Simulate.change(checkboxes[2]);

        assert.sameMembers(
          get(store.getState().test, 'foo'),
          [1, 2, 3], 'all checked');

        TestUtils.Simulate.change(checkboxes[0]);

        assert.sameMembers(
          get(store.getState().test, 'foo'),
          [2, 3], 'one unchecked');
      });

      it('should check the appropriate checkboxes when model is externally changed', () => {
        store.dispatch(actions.change('test.foo', [1, 2]));

        assert.isTrue(checkboxes[0].checked);
        assert.isTrue(checkboxes[1].checked);
        assert.isFalse(checkboxes[2].checked);
      });
    });

    describe('with <input type="checkbox" /> (custom onChange)', () => {
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', {
          foo: true,
        }),
      });

      const handleOnChange = sinon.spy((e) => e);

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field model="test.foo">
            <input type="checkbox" onChange={handleOnChange} />
          </Field>
        </Provider>
      );

      const checkbox = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      TestUtils.Simulate.change(checkbox);

      it('should call the custom onChange event handler', () => {
        assert.ok(handleOnChange.calledOnce);
      });

      it('should update the state as expected', () => {
        assert.isFalse(get(store.getState().test, 'foo'));
      });
    });

    describe('with <input type="file" />', () => {
      it('should update with an array of files', () => {
        const store = testCreateStore({
          testForm: formReducer('test'),
          test: modelReducer('test', { foo: [] }),
        });

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Field model="test.foo">
              <input type="file" />
            </Field>
          </Provider>
        );

        const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

        TestUtils.Simulate.change(input, {
          target: {
            type: 'file',
            files: [
              { name: 'first.jpg' },
              { name: 'second.jpg' },
            ],
          },
        });

        assert.deepEqual(
          get(store.getState().test, 'foo'),
          [
            { name: 'first.jpg' },
            { name: 'second.jpg' },
          ]);
      });
    });

    describe('with <select>', () => {
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', {
          foo: 'one',
        }),
      });

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
          get(store.getState().test, 'foo'),
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
          get(store.getState().test, 'foo'),
          'four');
      });
    });

    describe('with <select> (defaultValue)', () => {
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', {
          foo: undefined,
        }),
      });

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field model="test.foo">
            <select defaultValue="two">
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

      it('should select the option that matches the defaultValue attr'
        + 'if no initial value is provided', () => {
        assert.isFalse(options[0].selected);
        assert.isTrue(options[1].selected);
        assert.equal(select.value, 'two');
      });

      it('the store should have the correct initial value', () => {
        assert.equal(
          get(store.getState().test, 'foo'),
          'two');
      });
    });

    describe('validators and validateOn property', () => {
      const reducer = formReducer('test');
      const store = testCreateStore({
        testForm: reducer,
        test: modelReducer('test', {
          foo: '',
          blur: '',
          external: '',
        }),
      });

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
          store.getState().testForm.foo.errors,
          {
            good: false,
            bad: true,
            custom: false,
          });

        control.value = 'invalid';

        TestUtils.Simulate.change(control);

        assert.deepEqual(
          store.getState().testForm.foo.errors,
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
          store.getState().testForm.blur.errors,
          {
            good: false,
            bad: true,
            custom: false,
          }, 'should only validate upon blur');
      });

      it('should validate on external change', () => {
        let timesValidationCalled = 0;

        TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Field
              model="test.external"
              validators={{
                required: (val) => {
                  timesValidationCalled += 1;
                  return val && val.length;
                },
              }}
            >
              <input type="text" />
            </Field>
          </Provider>
        );

        assert.equal(timesValidationCalled, 1,
          'validation called on load');

        assert.isFalse(store.getState().testForm.external.valid);

        store.dispatch(actions.change('test.external', 'valid'));

        assert.isTrue(store.getState().testForm.external.valid);

        assert.equal(timesValidationCalled, 2,
          'validation called because of external change');
      });

      it('should send the proper model value to the validators', () => {
        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Field
              model="test.items[]"
              validators={{
                required: (val) => val && length(val),
                values: (val) => val,
              }}
            >
              <input type="checkbox" value="first" />
              <input type="checkbox" value="second" />
            </Field>
          </Provider>
        );

        const checkboxes = TestUtils.scryRenderedDOMComponentsWithTag(field, 'input');

        assert.isFalse(store.getState().testForm.items.valid);

        TestUtils.Simulate.change(checkboxes[0]);

        assert.isTrue(store.getState().testForm.items.$form.valid);
        assert.isTrue(
          store.getState().testForm.items.$form.validity.required);

        TestUtils.Simulate.change(checkboxes[1]);
        assert.isTrue(
          store.getState().testForm.items.$form.validity.required);
        assert.isTrue(
          store.getState().testForm.items.$form.validity.values);

        TestUtils.Simulate.change(checkboxes[0]);
        assert.isTrue(
          store.getState().testForm.items.$form.validity.required);
        assert.isTrue(
          store.getState().testForm.items.$form.validity.values);

        TestUtils.Simulate.change(checkboxes[1]);
        assert.isFalse(
          store.getState().testForm.items.$form.validity.required);
        assert.isFalse(store.getState().testForm.items.$form.valid);
      });
    });

    describe('asyncValidators and asyncValidateOn property', () => {
      const reducer = formReducer('test');
      const store = testCreateStore({
        testForm: reducer,
        test: modelReducer('test', {}),
      });

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
          (state) => state.focus === false,

          // initially valid
          (state) => state.validating === true && isValid(state),

          // true after validating
          (state) => state.validating === false && isValid(state),
        ];

        const actualStates = [];

        store.subscribe(() => {
          const state = store.getState();

          actualStates.push(state.testForm.foo);

          if (actualStates.length === expectedStates.length) {
            expectedStates.map((expectedFn, i) =>
              assert.ok(expectedFn(actualStates[i]), `${i}`)
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
          (state) => state.focus === false,

          // initially valid
          (state) => state.validating === true && isValid(state),

          // false after validating
          (state) => state.validating === false && !isValid(state),
        ];

        const actualStates = [];

        store.subscribe(() => {
          const state = store.getState();

          actualStates.push(state.testForm.foo);

          if (actualStates.length === expectedStates.length) {
            expectedStates.map((expectedFn, i) =>
              assert.ok(expectedFn(actualStates[i]), `${i}`)
            );

            done();
          }
        });

        TestUtils.Simulate.blur(control);
      });
    });

    describe('sync and async validators', () => {
      const reducer = formReducer('test');
      const store = testCreateStore({
        testForm: reducer,
        test: modelReducer('test', {}),
      });

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field
            model="test.foo"
            validators={{
              required: (val) => val && val.length,
            }}
            asyncValidators={{
              asyncValid: (_, asyncDone) => asyncDone(false),
            }}
          >
            <input type="text" />
          </Field>
        </Provider>
      );

      const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      it('async validation should not run when field is invalid', () => {
        input.value = '';
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.blur(input);

        assert.deepEqual(
          store.getState().testForm.foo.validity,
          {
            required: false,
          });

        assert.isUndefined(store.getState().testForm.foo.validity.asyncValid);
      });

      it('async validation should not override sync validity', () => {
        input.value = 'asdf';
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.blur(input);

        assert.isDefined(store.getState().testForm.foo.validity.asyncValid);

        assert.deepEqual(
          store.getState().testForm.foo.validity,
          {
            required: true,
            asyncValid: false,
          });
      });
    });

    describe('errors property', () => {
      const reducer = formReducer('test');

      it('should set the proper field state for errors', () => {
        const store = testCreateStore({
          testForm: reducer,
          test: modelReducer('test', {
            foo: '',
          }),
        });

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
          store.getState().testForm.foo.errors,
          {
            length: false,
            valid: false,
          });

        control.value = 'invalid string';

        TestUtils.Simulate.change(control);

        assert.deepEqual(
          store.getState().testForm.foo.errors,
          {
            length: 'too long',
            valid: 'not valid',
          });
      });

      it('should only validate errors on blur if validateOn="blur"', () => {
        const store = testCreateStore({
          testForm: reducer,
          test: modelReducer('test', {
            foo: '',
          }),
        });

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
          store.getState().testForm.foo.errors,
          {
            length: false,
            valid: false,
          });

        control.value = 'invalid string';


        TestUtils.Simulate.change(control);

        assert.deepEqual(
          store.getState().testForm.foo.errors,
          {
            length: false,
            valid: false,
          });

        TestUtils.Simulate.blur(control);

        assert.deepEqual(
          store.getState().testForm.foo.errors,
          {
            length: 'too long',
            valid: 'not valid',
          });
      });

      it('should handle a validator function for errors', () => {
        const store = testCreateStore({
          testForm: reducer,
          test: modelReducer('test', {
            foo: '',
          }),
        });

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Field
              model="test.foo"
              errors={(val) => !val && !val.length && 'Required'}
            >
              <input type="text" />
            </Field>
          </Provider>
        );

        const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

        assert.equal(
          store.getState().testForm.foo.errors,
          'Required');

        control.value = 'valid';

        TestUtils.Simulate.change(control);

        assert.deepEqual(
          store.getState().testForm.foo.errors,
          false);
      });
    });

    describe('dynamic components', () => {
      const reducer = formReducer('test');
      const store = testCreateStore({
        testForm: reducer,
        test: modelReducer('test', {}),
      });

      class DynamicSelectForm extends React.Component {
        constructor() {
          super();

          this.state = { options: [1, 2] };
        }

        render() {
          return (
            <div>
              <button onClick={() => this.setState({ options: [1, 2, 3] })} />
              <Field model="test.foo" dynamic>
                <select>
                  {this.state.options.map((option, i) =>
                    <option key={i} value={option} />
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
      const store = testCreateStore({
        test: modelReducer('test', {}),
        testForm: formReducer('test'),
      });

      it('should wrap children with specified component (string)', () => {
        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Field model="test.foo" component="div">
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
            return <main className="wrapper">{this.props.children}</main>;
          }
        }

        Wrapper.propTypes = { children: PropTypes.object };

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Field model="test.foo" component={Wrapper}>
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
            <Field model="test.foo" component={Wrapper}>
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
            <Field model="test.foo" className="wrapper">
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
        const store = testCreateStore({
          test: modelReducer('test', { foo: 'initial' }),
          testForm: formReducer('test'),
        });

        it(`should update the store when updateOn="${onEvent}"`, () => {
          const field = TestUtils.renderIntoDocument(
            <Provider store={store}>
              <Field
                model="test.foo"
                updateOn={onEvent}
              >
                <input type="text" />
              </Field>
            </Provider>
          );

          const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

          assert.equal(get(store.getState().test, 'foo'), 'initial');

          const testValue = `${onEvent} test`;

          control.value = testValue;

          assert.equal(get(store.getState().test, 'foo'), 'initial',
            'Model value should not change yet');

          TestUtils.Simulate[onEvent](control);

          assert.equal(get(store.getState().test, 'foo'), testValue);
        });
      });
    });

    describe('validation on load', () => {
      const reducer = formReducer('test');
      const store = testCreateStore({
        testForm: reducer,
        test: modelReducer('test', {
          foo: 'invalid',
        }),
      });

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
          store.getState().testForm.foo,
          {
            validity: {
              initial: false,
            },
            errors: {
              initial: true,
            },
          });

        assert.isFalse(store.getState().testForm.foo.valid);
      });
    });

    describe('syncing control defaultValue on load', () => {
      const reducer = modelReducer('test', { foo: '' });
      const store = testCreateStore({
        test: reducer,
        testForm: formReducer('test'),
      });

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
          get(store.getState().test, 'foo'),
          'testing');
      });
    });

    describe('change on enter', () => {
      const reducer = modelReducer('test');
      const store = testCreateStore({
        test: reducer,
        testForm: formReducer('test'),
      });

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
          get(store.getState().test, 'foo'),
          'testing');
      });
    });

    describe('changeAction prop', () => {
      const reducer = modelReducer('test', { foo: '' });
      const store = testCreateStore({
        test: reducer,
        testForm: formReducer('test'),
      });

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
          get(store.getState().test, 'foo'),
          'testing');
      });
    });

    describe('event handlers on control', () => {
      const reducer = modelReducer('test', { foo: '', bar: '' });
      const store = testCreateStore({
        test: reducer,
        testForm: formReducer('test'),
      });

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

      it('should not execute custom onChange functions of unchanged controls', () => {
        const onChangeFn = (val) => val;
        const onChangeFnSpy = sinon.spy(onChangeFn);

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <div>
              <Field
                model="test.foo"
              >
                <input type="text" onChange={onChangeFnSpy} />
              </Field>
              <Field
                model="test.bar"
              >
                <input type="text" />
              </Field>
            </div>
          </Provider>
        );

        const [_, controlBar] = TestUtils.scryRenderedDOMComponentsWithTag(field, 'input');

        controlBar.value = 'testing';

        TestUtils.Simulate.change(controlBar);

        assert.isFalse(onChangeFnSpy.called);
      });

      it('should only execute custom onChange function pertaining to the changed input', () => {
        const onChangeFnFoo = (val) => val;
        const onChangeFnBar = (val) => val;
        const onChangeFnFooSpy = sinon.spy(onChangeFnFoo);
        const onChangeFnBarSpy = sinon.spy(onChangeFnBar);

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <div>
              <Field
                model="test.foo"
              >
                <input type="text" onChange={onChangeFnFooSpy} />
              </Field>
              <Field
                model="test.bar"
              >
                <input type="text" onChange={onChangeFnBarSpy} />
              </Field>
            </div>
          </Provider>
        );

        const [_, controlBar] = TestUtils.scryRenderedDOMComponentsWithTag(field, 'input');

        controlBar.value = 'testing';

        TestUtils.Simulate.change(controlBar);

        assert.isFalse(onChangeFnFooSpy.called);
        assert.isTrue(onChangeFnBarSpy.called);
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
              <div>{false}</div>
            </Field>
          </Provider>
        );

        const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

        control.value = 'testing 2';

        TestUtils.Simulate.change(control);

        assert.isTrue(onChangeFnSpy.calledOnce);
        assert.isUndefined(onChangeFnSpy.returnValues[0]);
        assert.equal(
          get(store.getState().test, 'foo'),
          'testing 2');
      });

      ['focus', 'blur'].forEach((event) => {
        const eventHandler = `on${capitalize(event)}`;

        it(`should execute the custom ${event} action`, () => {
          let targetValue;

          const onEvent = (e) => {
            targetValue = e.target.value;

            return e;
          };

          const onEventSpy = sinon.spy(onEvent);

          const prop = { [eventHandler]: onEventSpy };

          const field = TestUtils.renderIntoDocument(
            <Provider store={store}>
              <Field
                model="test.foo"
              >
                <input type="text" {...prop} />
              </Field>
            </Provider>
          );

          const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

          control.value = `testing ${event}`;

          TestUtils.Simulate[event](control);

          assert.isTrue(onEventSpy.calledOnce);
          assert.isObject(onEventSpy.returnValues[0]);
          assert.equal(
            onEventSpy.returnValues[0].constructor.name,
            'SyntheticEvent');

          assert.equal(targetValue, `testing ${event}`);
        });
      });
    });

    // TODO: control
    it('should remove the item at the specified index of the array'
      + 'represented by the model', (done) => {
      const initialState = {
        foo: [
          { val: 1 },
          { val: 2 },
          { val: 3 },
        ],
      };

      /* eslint-disable global-require */
      const store = createTestStore(createStore(combineReducers({
        form: formReducer('test', initialState),
        test: modelReducer('test', initialState),
      }), applyMiddleware(require('redux-thunk').default)), done);
      /* eslint-enable */

      const index = 1;
      TestUtils.renderIntoDocument(
        <Provider store={store}>
          <div>
            <Field model="test.foo.0.val">
              <div>
                <label />
                <input defaultValue="value" />
              </div>
            </Field>
            <Field model="test.foo.1.val">
              <div>
                <label />
                <input defaultValue="value" />
              </div>
            </Field>
            <Field model="test.foo.2.val">
              <div>
                <label />
                <input defaultValue="value" />
              </div>
            </Field>
          </div>
        </Provider>
      );

      assert.equal(get(store.getState().test, 'foo').length, 3);

      store.when(actionTypes.CHANGE, (state) => {
        assert.equal(get(state.test, 'foo').length, 2);
      });

      store.dispatch(actions.remove('test.foo', index));
    });

    // TODO: control
    it('should maintain child references', (done) => {
      const store = testCreateStore({
        test: modelReducer('test', { foo: '' }),
        testForm: formReducer('test'),
      });

      class TestContainer extends React.Component {
        constructor() {
          super();

          this.handleClick = this.handleClick.bind(this);
          this.assignRef = this.assignRef.bind(this);
        }

        handleClick() {
          assert.isDefined(this.node,
            'reference should exist');
          done();
        }

        assignRef(node) {
          this.node = node;
        }

        render() {
          return (
            <main onClick={this.handleClick}>
              <Field model="test.foo">
                <input ref={this.assignRef} />
              </Field>
            </main>
          );
        }
      }

      const foo = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <TestContainer />
        </Provider>
      );

      const main = TestUtils.findRenderedDOMComponentWithTag(foo, 'main');

      TestUtils.Simulate.click(main);
    });

    // TODO: control
    it('should not override custom value prop', () => {
      const store = testCreateStore({
        test: modelReducer('test', { foo: '' }),
        testForm: formReducer('test'),
      });

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field model="test.foo">
            <input value="defined" />
          </Field>
        </Provider>
      );

      const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      assert.equal(input.value, 'defined');

      input.value = 'changed';

      TestUtils.Simulate.change(input);

      assert.equal(input.value, 'defined',
        'externally controlled input should not change');
    });

    // TODO: control
    it('should allow an input to remain uncontrolled with value={undefined}', () => {
      const store = testCreateStore({
        test: modelReducer('test', { foo: '' }),
        testForm: formReducer('test'),
      });

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field model="test.foo">
            <input value={undefined} />
          </Field>
        </Provider>
      );

      const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      input.value = 'changed';

      TestUtils.Simulate.change(input);

      assert.equal(input.value, 'changed');
    });

    // TODO: control
    xit('should render a Component with an idempotent mapStateToProps', () => {
      const store = testCreateStore({
        test: modelReducer('test', { foo: '' }),
        testForm: formReducer('test'),
      });

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field model="test.foo">
            <input />
          </Field>
        </Provider>
      );
      const filter = ({ constructor }) =>
        constructor.displayName === 'Connect(Control)';
      const components = TestUtils.findAllInRenderedTree(field, filter);
      assert.lengthOf(components, 1, 'exactly one connected Control was rendered');
      const [component] = components;
      const oldStateProps = component.stateProps;
      const didUpdate = component.updateStatePropsIfNeeded();
      const failures = Object.keys(component.stateProps).filter((k) =>
        component.stateProps[k] !== oldStateProps[k]);
      assert(
        !didUpdate,
        `stateProps should not have changed, changed props: ${failures.join(', ')}`);
    });

    // TODO: control
    it('should not override the name prop', () => {
      const store = testCreateStore({
        test: modelReducer('test', { foo: '' }),
        testForm: formReducer('test'),
      });

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field model="test.foo">
            <input name="another[name]" />
          </Field>
        </Provider>
      );

      const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      assert.equal(input.name, 'another[name]');
    });

    // TODO: control
    it('should allow a custom mapProps() prop for use in Control', () => {
      const store = testCreateStore({
        test: modelReducer('test', { foo: 'initial' }),
        testForm: formReducer('test'),
      });

      const CustomInput = (props) => (
        <div><input {...props} /></div>
      );

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Field
            model="test.foo"
            mapProps={controls.text}
          >
            <CustomInput />
          </Field>
        </Provider>
      );

      const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      assert.equal(input.value, 'initial');

      input.value = 'new value';

      TestUtils.Simulate.change(input);

      assert.equal(input.value, 'new value');
      assert.equal(
        get(store.getState().test, 'foo'),
        'new value'
      );
    });

    describe('unmounting', () => {
      it('should set the validity of the model to true when umounted', () => {
        const store = testCreateStore({
          test: modelReducer('test', { foo: '' }),
          testForm: formReducer('test', { foo: '' }),
        });

        const container = document.createElement('div');

        const field = ReactDOM.render(
          <Provider store={store}>
            <Field
              model="test.foo"
            >
              <input />
            </Field>
          </Provider>,
        container);

        const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

        store.dispatch(actions.setValidity('test.foo', false));
        assert.isFalse(store.getState().testForm.foo.valid);

        ReactDOM.unmountComponentAtNode(container);

        assert.isTrue(store.getState().testForm.foo.valid);
      });

      it('should only reset the validity of field-specific validators', () => {
        const store = testCreateStore({
          test: modelReducer('test', { foo: '' }),
          testForm: formReducer('test', { foo: '' }),
        });

        const container = document.createElement('div');

        const field = ReactDOM.render(
          <Provider store={store}>
            <Field
              model="test.foo"
              validators={{
                internal: () => false,
              }}
            >
              <input />
            </Field>
          </Provider>,
        container);

        const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

        assert.isFalse(store.getState().testForm.foo.valid);

        store.dispatch(actions.setValidity('test.foo', {
          ...store.getState().testForm.foo.validity,
          external: false,
        }));

        assert.isFalse(store.getState().testForm.foo.valid);

        ReactDOM.unmountComponentAtNode(container);

        assert.isFalse(store.getState().testForm.foo.valid);

        store.dispatch(actions.setValidity('test.foo', {
          ...store.getState().testForm.foo.validity,
          external: true,
        }));

        assert.isTrue(store.getState().testForm.foo.valid);
      });

      it('should not clobber other non-field-specific validators', () => {
        const initialState = {};
        const store = testCreateStore({
          test: modelReducer('test', initialState),
          testForm: formReducer('test', initialState),
        });

        store.dispatch(actions.setValidity('test.foo', {
          validator: false,
        }));

        const container = document.createElement('div');

        class WrappedControl extends React.Component {
          componentWillUnmount() {
            store.dispatch(actions.setErrors('test.foo', {}));
          }

          render() {
            return <Field model="test.foo" />;
          }
        }

        ReactDOM.render(
          <Provider store={store}>
            <WrappedControl />
          </Provider>,
          container);

        assert.isFalse(store.getState().testForm.foo.validity.validator);

        ReactDOM.unmountComponentAtNode(container);

        assert.isUndefined(store.getState().testForm.foo.validity.validator);
      });
    });

    describe('with input type="reset"', () => {
      it('should reset the given model', () => {
        const store = testCreateStore({
          test: modelReducer('test', { foo: '' }),
          testForm: formReducer('test', { foo: '' }),
        });

        const container = document.createElement('div');

        const field = ReactDOM.render(
          <Provider store={store}>
            <div>
              <Field
                model="test.foo"
              >
                <input type="text" />
              </Field>
              <Field
                model="test.foo"
              >
                <input type="reset" />
              </Field>
            </div>
          </Provider>,
        container);

        const [input, reset] = TestUtils.scryRenderedDOMComponentsWithTag(field, 'input');

        input.value = 'changed';

        TestUtils.Simulate.change(input);

        assert.equal(get(store.getState().test, 'foo'), 'changed');

        TestUtils.Simulate.click(reset);

        assert.equal(get(store.getState().test, 'foo'), '');
      });
    });

    describe('with edge-case values', () => {
      it('should work with value = 0', () => {
        const store = testCreateStore({
          test: modelReducer('test', { foo: 0 }),
          testForm: formReducer('test'),
        });

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Field model="test.foo">
              <input type="text" />
            </Field>
          </Provider>
        );

        const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

        assert.equal(input.value, '0');
      });
    });

    describe('external change with updateOn="blur"', () => {
      it('should update the input value on external change', () => {
        const store = testCreateStore({
          test: modelReducer('test', { foo: '' }),
          testForm: formReducer('test'),
        });

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Field model="test.foo" updateOn="blur">
              <input type="text" />
            </Field>
          </Provider>
        );

        const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

        assert.equal(input.value, '');

        store.dispatch(actions.change('test.foo', 'external'));

        assert.equal(input.value, 'external');
      });
    });

    describe('whitelisting props', () => {
      it('should not pass extraneous props to child components', () => {
        const store = testCreateStore({
          test: modelReducer('test', { foo: 0 }),
          testform: formReducer('test'),
        });

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Field
              model="test.foo"
              className="test-class"
              style={{ color: 'red' }}
            >
              <input type="text" />
            </Field>
          </Provider>
        );

        const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

        assert.isNull(input.getAttribute('class'));
        assert.isNull(input.getAttribute('style'));
      });
    });

    describe('function as children', () => {
      const store = testCreateStore({
        test: modelReducer('test', { foo: 'bar' }),
        testForm: formReducer('test'),
      });
      const field = testRender(
        <Field model="test.foo">
        {(fieldValue) => <input
          className={fieldValue.focus
            ? 'focused'
            : ''
          }
        />}
        </Field>, store);

      const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

      it('treats the return value as expected with normal children', () => {
        assert.equal(input.value, 'bar');

        input.value = 'testing';
        TestUtils.Simulate.change(input);

        assert.equal(input.value, 'testing');
        assert.equal(get(store.getState().test, 'foo'), 'testing');
      });

      it('rerenders the function when the field value changes', () => {
        assert.throws(() => TestUtils.findRenderedDOMComponentWithClass(field, 'focused'));

        TestUtils.Simulate.focus(input);

        assert.isTrue(store.getState().testForm.foo.focus);

        assert.ok(TestUtils.findRenderedDOMComponentWithClass(field, 'focused'));
      });
    });
  });
});
