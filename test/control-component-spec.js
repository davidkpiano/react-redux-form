/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import { assert } from 'chai';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import { Provider } from 'react-redux';
import sinon from 'sinon';
import capitalize from '../src/utils/capitalize';
import _get from 'lodash.get';
import toPath from 'lodash.topath';
import i from 'icepick';
import Immutable from 'immutable';

import { testCreateStore, testRender } from './utils';

import {
  controls as _controls,
  modelReducer as _modelReducer,
  formReducer as _formReducer,
  Control as _Control,
  actions as _actions,
} from '../src';
import {
  controls as immutableControls,
  modelReducer as immutableModelReducer,
  formReducer as immutableFormReducer,
  Control as immutableControl,
  actions as immutableActions,
} from '../immutable';

const testContexts = {
  standard: {
    controls: _controls,
    modelReducer: _modelReducer,
    formReducer: _formReducer,
    Control: _Control,
    actions: _actions,
    object: {},
    get: _get,
    set: (state, path, value) => i.setIn(state, path, value),
    getInitialState: (state) => state,
  },
  immutable: {
    controls: immutableControls,
    modelReducer: immutableModelReducer,
    formReducer: immutableFormReducer,
    Control: immutableControl,
    actions: immutableActions,
    object: new Immutable.Map(),
    get: (value, path) => {
      const result = value.getIn(toPath(path));
      try {
        return result.toJS();
      } catch (e) {
        return result;
      }
    },
    set: (state, path, value) => state.setIn(path, value),
    getInitialState: (state) => Immutable.fromJS(state),
  },
};

Object.keys(testContexts).forEach((testKey) => {
  const testContext = testContexts[testKey];
  const controls = testContext.controls;
  const modelReducer = testContext.modelReducer;
  const formReducer = testContext.formReducer;
  const Control = testContext.Control;
  const actions = testContext.actions;
  const object = testContext.object;
  const get = testContext.get;
  const getInitialState = testContext.getInitialState;

  describe(`<Control> component (${testKey} context)`, () => {
    describe('existence check', () => {
      it('should exist', () => {
        assert.ok(Control);
      });
    });

    describe('basic functionality', () => {
      const initialState = getInitialState({ foo: 'bar' });
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', initialState),
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

        assert.equal(get(store.getState().test, 'foo'), 'new');
      });
    });

    describe('onLoad prop', () => {
      const initialState = getInitialState({ foo: 'bar' });
      const store = testCreateStore({
        test: modelReducer('test', initialState),
        testForm: formReducer('test', initialState),
      });

      const handleLoad = sinon.spy();

      const form = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Control
            model="test.foo"
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
    const textFieldElements = [
      [''],
      ['text'],
      ['input', 'text'],
      ['input', 'password'],
      ['input', 'number'],
      ['input', 'color'],
      ['textarea'],
    ];

    textFieldElements.forEach(([controlType, type]) => {
      describe(`with <Control.${controlType}> ${type ? `and type="${type}"` : ''}`, () => {
        const initialState = getInitialState({ foo: 'bar' });
        const store = testCreateStore({
          testForm: formReducer('test'),
          test: modelReducer('test', initialState),
        });

        const TestControl = Control[controlType] || Control;

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <TestControl model="test.foo" type={type} />
          </Provider>
        );

        const node = TestUtils.findRenderedDOMComponentWithTag(field,
          controlType === 'textarea' ? 'textarea' : 'input');

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

        if (controlType === 'text') {
          it('should have a type="text"', () => {
            assert.equal(node.getAttribute('type'), 'text');
          });
        } else {
          it('should have the appropriate type attribute', () => {
            assert.equal(node.getAttribute('type'), type);
          });
        }
      });
    });

    describe('with <Control.radio />', () => {
      const initialState = getInitialState({ foo: 'two' });
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', initialState),
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

    describe('with <Control.checkbox /> (single toggle)', () => {
      const initialState = getInitialState({ single: true });
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', initialState),
      });

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Control.checkbox model="test.single" />
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

    describe('with <Control.checkbox /> (multi toggle)', () => {
      const initialState = getInitialState({ foo: [1] });
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', initialState),
      });

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <div>
            <Control.checkbox model="test.foo[]" value={1} />
            <Control.checkbox model="test.foo[]" value={2} />
            <Control.checkbox model="test.foo[]" value={3} />
          </div>
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

    describe('with <Control.checkbox /> (custom onChange)', () => {
      const initialState = getInitialState({ foo: true });
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', initialState),
      });

      const handleOnChange = sinon.spy((e) => e);

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Control.checkbox model="test.foo" onChange={handleOnChange} />
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

    describe('with <Control.file />', () => {
      it('should update with an array of files', () => {
        const initialState = getInitialState({ foo: [] });
        const store = testCreateStore({
          testForm: formReducer('test'),
          test: modelReducer('test', initialState),
        });

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Control.file model="test.foo" />
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

    describe('with <Control.select />', () => {
      const initialState = getInitialState({ foo: 'one' });
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', initialState),
      });

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Control.select model="test.foo">
            <option value="one" />
            <option value="two" />
            <option value="three" />
            <optgroup>
              <option value="four" />
              <option value="five" />
              <option value="six" />
            </optgroup>
          </Control.select>
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

    describe('ignoring events with ignore prop', () => {
      const initialState = getInitialState({ foo: 'bar' });
      const store = testCreateStore({
        test: modelReducer('test', initialState),
        testForm: formReducer('test', initialState),
      });

      const control = testRender(
        <Control.text
          model="test.foo"
          ignore={['focus', 'blur']}
        />, store);

      const input = TestUtils.findRenderedDOMComponentWithTag(control, 'input');

      it('ignores the events specified in the ignore prop', () => {
        assert.isFalse(store.getState().testForm.foo.focus);

        TestUtils.Simulate.focus(input);

        assert.isFalse(store.getState().testForm.foo.focus,
          'focus event should be ignored');

        TestUtils.Simulate.blur(input);

        assert.isFalse(store.getState().testForm.foo.touched,
          'blur event should be ignored');
      });
    });

    describe('validators and validateOn property', () => {
      const initialState = getInitialState({
        foo: '',
        blur: '',
        external: '',
      });

      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', initialState),
      });

      it('should set the proper field state for validation', () => {
        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Control.text
              model="test.foo"
              validators={{
                good: () => true,
                bad: () => false,
                custom: val => val !== 'invalid',
              }}
            />
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
            <Control.text
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
            />
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
            <Control.text
              model="test.external"
              validators={{
                required: (val) => {
                  timesValidationCalled += 1;
                  return val && val.length;
                },
              }}
            />
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
    });

    describe('validateOn != updateOn', () => {
      const initialState = {
        foo: 'one',
      };

      const radioStore = testCreateStore({
        testForm: formReducer('test', initialState),
        test: modelReducer('test', initialState),
      });

      const app = TestUtils.renderIntoDocument(
        <Provider store={radioStore}>
          <Control.radio
            model="test.foo"
            value="two"
            validateOn="focus"
            validators={{
              isOne: (val) => val === 'one',
            }}
          />
        </Provider>
      );

      const input = TestUtils.findRenderedDOMComponentWithTag(app, 'input');

      it('should initially be valid', () => {
        assert.isTrue(radioStore.getState().testForm.foo.valid);
      });

      it('should still be valid after focusing', () => {
        TestUtils.Simulate.focus(input);

        assert.isTrue(radioStore.getState().testForm.foo.valid);
        assert.isTrue(radioStore.getState().testForm.foo.focus);
      });
    });

    describe('asyncValidators and asyncValidateOn property', () => {
      const reducer = formReducer('test');
      const store = testCreateStore({
        testForm: reducer,
        test: modelReducer('test', object),
      });

      it('should set the proper field state for a valid async validation', done => {
        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Control.text
              model="test.foo"
              asyncValidators={{
                testValid: (val, _done) => setTimeout(() => _done(true), 10),
              }}
              asyncValidateOn="blur"
            />
          </Provider>
        );

        const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

        const expectedStates = [
          (state) => state.focus === false,

          // initially valid
          (state) => state.validating === true && state.valid,

          // true after validating
          (state) => state.validating === false && state.valid,
        ];

        const actualStates = [];

        store.subscribe(() => {
          const state = store.getState();

          actualStates.push(state.testForm.foo);

          if (actualStates.length === expectedStates.length) {
            expectedStates.map((expectedFn, index) =>
              assert.ok(expectedFn(actualStates[index]), `${index}`)
            );

            done();
          }
        });

        TestUtils.Simulate.blur(control);
      });

      it('should set the proper field state for an invalid async validation', done => {
        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Control.text
              model="test.foo"
              asyncValidators={{
                testValid: (val, _done) => setTimeout(() => _done(false), 10),
              }}
              asyncValidateOn="blur"
            />
          </Provider>
        );

        const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

        const expectedStates = [
          (state) => state.focus === false,

          // initially valid
          (state) => state.validating === true && state.valid,

          // false after validating
          (state) => state.validating === false && !state.valid,
        ];

        const actualStates = [];

        store.subscribe(() => {
          const state = store.getState();

          actualStates.push(state.testForm.foo);

          if (actualStates.length === expectedStates.length) {
            expectedStates.map((expectedFn, index) =>
              assert.ok(expectedFn(actualStates[index]), `${index}`)
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
        test: modelReducer('test', object),
      });

      const field = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Control.text
            model="test.foo"
            validators={{
              required: (val) => val && val.length,
            }}
            asyncValidators={{
              asyncValid: (_, asyncDone) => asyncDone(false),
            }}
          />
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

    describe('validation after reset', () => {
      const initialState = getInitialState({ foo: '' });
      const reducer = formReducer('test');
      const store = testCreateStore({
        testForm: reducer,
        test: modelReducer('test', initialState),
      });

      TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Control.text
            model="test.foo"
            validators={{
              required: (val) => val && val.length,
            }}
          />
        </Provider>
      );

      it('should initially be invalid', () => {
        assert.deepEqual(
          store.getState().testForm.foo.validity,
          {
            required: false,
          });
      });

      it('should still be invalid after resetting the form model', () => {
        store.dispatch(actions.reset('test'));

        assert.deepEqual(
          store.getState().testForm.foo.validity,
          {
            required: false,
          });
      });

      it('should still be invalid after resetting the field model', () => {
        store.dispatch(actions.reset('test.foo'));

        assert.deepEqual(
          store.getState().testForm.foo.validity,
          {
            required: false,
          });
      });
    });

    describe('initial value after reset', () => {
      const initialState = getInitialState({ foo: '' });
      const reducer = formReducer('test');
      const store = testCreateStore({
        testForm: reducer,
        test: modelReducer('test', initialState),
      });

      TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Control.text
            model="test.foo"
          />
        </Provider>
      );

      it('should reset the control to the last loaded value', () => {
        store.dispatch(actions.load('test.foo', 'new foo'));
        store.dispatch(actions.reset('test.foo'));

        assert.equal(get(store.getState().test, 'foo'), 'new foo');
      });
    });

    describe('errors property', () => {
      const reducer = formReducer('test');

      it('should set the proper field state for errors', () => {
        const initialState = getInitialState({ foo: '' });
        const store = testCreateStore({
          testForm: reducer,
          test: modelReducer('test', initialState),
        });

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Control.text
              model="test.foo"
              errors={{
                length: (val) => val.length > 8 && 'too long',
                valid: (val) => val !== 'valid' && 'not valid',
              }}
            />
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
        const initialState = getInitialState({ foo: '' });
        const store = testCreateStore({
          testForm: reducer,
          test: modelReducer('test', initialState),
        });

        let timesValidationCalled = 0;

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Control.text
              model="test.foo"
              errors={{
                length: (val) => val.length > 8 && 'too long',
                valid: (val) => {
                  timesValidationCalled += 1;
                  return val !== 'valid' && 'not valid';
                },
              }}
              validateOn="blur"
              required
            />
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
        const initialState = getInitialState({ foo: '' });
        const store = testCreateStore({
          testForm: reducer,
          test: modelReducer('test', initialState),
        });

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Control.text
              model="test.foo"
              errors={(val) => !val && !val.length && 'Required'}
            />
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
        test: modelReducer('test', object),
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
              <Control.select model="test.foo" dynamic>
                {this.state.options.map((option, index) =>
                  <option key={index} value={option} />
                )}
              </Control.select>
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

    describe('updateOn prop', () => {
      const onEvents = [
        'change',
        'focus',
        'blur',
      ];

      onEvents.forEach((onEvent) => {
        const initialState = getInitialState({ foo: 'initial' });
        const store = testCreateStore({
          test: modelReducer('test', initialState),
          testForm: formReducer('test'),
        });

        it(`should update the store when updateOn="${onEvent}"`, () => {
          const field = TestUtils.renderIntoDocument(
            <Provider store={store}>
              <Control.text
                model="test.foo"
                updateOn={onEvent}
              />
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
      const initialState = getInitialState({ foo: 'invalid' });
      const reducer = formReducer('test');
      const store = testCreateStore({
        testForm: reducer,
        test: modelReducer('test', initialState),
      });

      it('should always validate the model initially', () => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Control.text
              model="test.foo"
              validators={{
                initial: (val) => val !== 'invalid',
              }}
            />
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
      const initialState = getInitialState({ foo: '' });
      const reducer = modelReducer('test', initialState);
      const store = testCreateStore({
        test: reducer,
        testForm: formReducer('test'),
      });

      it('should change the model to the defaultValue on load', () => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Control.text
              model="test.foo"
              defaultValue="testing"
            />
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
            <Control.text
              model="test.foo"
              updateOn="blur"
            />
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

    describe('handling onKeyPress', () => {
      const eventData = {
        key: 'a',
        keyCode: 65,
        which: 65,
      };

      const reducer = modelReducer('test');
      const store = testCreateStore({
        test: reducer,
        testForm: formReducer('test'),
      });

      it('should pass keyPress events to onKeyPress', (done) => {
        function handleKeyPress(event) {
          assert.containSubset(event, eventData);
          done();
        }

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Control.text
              model="test.foo"
              onKeyPress={handleKeyPress}
            />
          </Provider>
        );

        const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

        TestUtils.Simulate.keyPress(control, eventData);
      });
    });

    describe('changeAction prop', () => {
      const initialState = getInitialState({
        foo: '',
        checked: false,
      });
      const reducer = modelReducer('test', initialState);
      const store = testCreateStore({
        test: reducer,
        testForm: formReducer('test'),
      });

      it('should execute the custom change action', () => {
        let customChanged = false;

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Control.text
              model="test.foo"
              changeAction={(model, value) => {
                customChanged = true;
                return actions.change(model, value);
              }}
            />
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

      it('should execute the custom change action (checkbox)', () => {
        let customChanged = false;

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Control.checkbox
              model="test.checked"
              changeAction={() => {
                customChanged = true;
              }}
            />
          </Provider>
        );

        const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

        TestUtils.Simulate.change(control);

        assert.isTrue(customChanged);
      });

      it('should provide the inverse of the model value (checkbox)', (done) => {
        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Control.checkbox
              model="test.customChecked"
              changeAction={(model, value) => {
                assert.equal(model, 'test.customChecked');
                assert.equal(value, true); // initial value is false
                done();
              }}
            />
          </Provider>
        );

        const control = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

        TestUtils.Simulate.change(control);
      });
    });

    describe('event handlers on control', () => {
      const initialState = getInitialState({
        foo: '',
        bar: '',
      });

      const reducer = modelReducer('test', initialState);
      const store = testCreateStore({
        test: reducer,
        testForm: formReducer('test'),
      });

      it('should execute the custom change action', () => {
        const onChangeFn = (val) => val;
        const onChangeFnSpy = sinon.spy(onChangeFn);

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Control.text
              model="test.foo"
              onChange={onChangeFnSpy}
            />
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
              <Control.text
                model="test.foo"
                onChange={onChangeFnSpy}
              />
              <Control.text
                model="test.bar"
              />
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
              <Control.text
                model="test.foo"
                onChange={onChangeFnFooSpy}
              />
              <Control.text
                model="test.bar"
                onChange={onChangeFnBarSpy}
              />
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
        const onChangeFn = () => {
        };
        const onChangeFnSpy = sinon.spy(onChangeFn);

        const field = TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Control.text
              model="test.foo"
              onChange={onChangeFnSpy}
            />
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
              <Control.text
                model="test.foo"
                {...prop}
              />
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


    describe('unmounting', () => {
      it('should set the validity of the model to true when umounted', () => {
        const initialState = getInitialState({ foo: '' });
        const store = testCreateStore({
          test: modelReducer('test', initialState),
          testForm: formReducer('test', initialState),
        });

        const container = document.createElement('div');

        const field = ReactDOM.render(
          <Provider store={store}>
            <Control.input model="test.foo" />
          </Provider>,
          container);

        const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

        store.dispatch(actions.setValidity('test.foo', false));
        assert.isFalse(store.getState().testForm.foo.valid);

        ReactDOM.unmountComponentAtNode(container);

        assert.isTrue(store.getState().testForm.foo.valid);
      });

      it('should only reset the validity of field-specific validators', () => {
        const initialState = getInitialState({ foo: '' });
        const store = testCreateStore({
          test: modelReducer('test', initialState),
          testForm: formReducer('test', initialState),
        });

        const container = document.createElement('div');

        const field = ReactDOM.render(
          <Provider store={store}>
            <Control.input
              model="test.foo"
              validators={{
                internal: () => false,
              }}
            />
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
    });

    describe('with <Control.reset>', () => {
      it('should reset the given model', () => {
        const initialState = getInitialState({ foo: '' });
        const store = testCreateStore({
          test: modelReducer('test', initialState),
          testForm: formReducer('test', initialState),
        });

        const container = document.createElement('div');

        const field = ReactDOM.render(
          <Provider store={store}>
            <div>
              <Control.input
                model="test.foo"
              />
              <Control.reset model="test.foo" />
            </div>
          </Provider>,
          container);

        const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');
        const reset = TestUtils.findRenderedDOMComponentWithTag(field, 'button');

        input.value = 'changed';

        TestUtils.Simulate.change(input);

        assert.equal(get(store.getState().test, 'foo'), 'changed');

        TestUtils.Simulate.click(reset);

        assert.equal(get(store.getState().test, 'foo'), '');
      });
    });

    describe('with <Control.button>', () => {
      it('should exist', () => {
        assert.isFunction(Control.button);
      });

      const disabledProps = [
        true,
        { valid: false },
        (fieldValue) => !fieldValue.valid,
      ];

      disabledProps.forEach((disabled) => {
        it(`should be disabled with ${typeof disabled} as disabled prop value`, () => {
          const initialState = getInitialState({ foo: '' });
          const store = testCreateStore({
            testForm: formReducer('test', initialState),
          });

          const field = testRender(
            <Control.button model="test" disabled={disabled} />,
            store);

          const button = TestUtils.findRenderedDOMComponentWithTag(field, 'button');

          store.dispatch(actions.setValidity('test', false));

          assert.isTrue(button.disabled);

          if (disabled !== true) {
            store.dispatch(actions.setValidity('test', true));

            assert.isFalse(button.disabled);
          }
        });
      });
    });

    describe('manual focus/blur', () => {
      const initialState = getInitialState({ foo: 'bar' });
      const store = testCreateStore({
        test: modelReducer('test', initialState),
        testForm: formReducer('test', initialState),
      });

      const control = testRender(
        <Control.text
          model="test.foo"
        />, store);

      const input = TestUtils.findRenderedDOMComponentWithTag(control, 'input');

      it('should manually focus the control', () => {
        store.dispatch(actions.focus('test.foo'));

        assert.equal(document.activeElement, input);
      });

      xit('should manually blur the control', () => {
        store.dispatch(actions.focus('test.foo'));

        assert.equal(document.activeElement, input);

        store.dispatch(actions.blur('test.foo'));

        assert.notEqual(document.activeElement, input);
      });
    });

    describe('handling on multiple events', () => {
      const initialState = getInitialState({ foo: 'bar' });
      const store = testCreateStore({
        test: modelReducer('test', initialState),
        testForm: formReducer('test', initialState),
      });

      const control = testRender(
        <Control.text
          model="test.foo"
          updateOn={['change', 'blur']}
        />, store);

      const input = TestUtils.findRenderedDOMComponentWithTag(control, 'input');

      it('should update on change', () => {
        input.value = 'update on change';

        TestUtils.Simulate.change(input);

        assert.equal(get(store.getState().test, 'foo'), 'update on change');
      });

      it('should update on blur', () => {
        input.value = 'update on blur';

        TestUtils.Simulate.blur(input);

        assert.equal(get(store.getState().test, 'foo'), 'update on blur');
      });
    });
  });
});
