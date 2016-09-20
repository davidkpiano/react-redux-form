/* eslint react/no-multi-comp:0 react/jsx-no-bind:0 */
import { assert } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import capitalize from 'lodash/capitalize';

import { controls, modelReducer, formReducer, Control, actions } from '../src';
import { testCreateStore, testRender } from './utils';
import handleFocus from '../src/utils/handle-focus';

describe('<Control> component', () => {
  describe('existence check', () => {
    it('should exist', () => {
      assert.ok(Control);
    });
  });

  describe('basic functionality', () => {
    const store = testCreateStore({
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
    const store = testCreateStore({
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
  const textFieldElements = [
    ['text'],
    ['input', 'text'],
    ['input', 'password'],
    ['input', 'number'],
    ['input', 'color'],
    ['textarea'],
  ];

  textFieldElements.forEach(([controlType, type]) => {
    describe(`with <Control.${controlType}> ${type ? `and type="${type}"` : ''}`, () => {
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', { foo: 'bar' }),
      });

      const TestControl = Control[controlType];

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
    const store = testCreateStore({
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

  describe('with <Control.checkbox /> (single toggle)', () => {
    const store = testCreateStore({
      testForm: formReducer('test'),
      test: modelReducer('test', {
        single: true,
      }),
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

  describe('with <Control.checkbox /> (multi toggle)', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      testForm: formReducer('test'),
      test: modelReducer('test', {
        foo: [1],
      }),
    }));

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

  describe('with <Control.checkbox /> (custom onChange)', () => {
    const store = testCreateStore({
      testForm: formReducer('test'),
      test: modelReducer('test', {
        foo: true,
      }),
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
      assert.isFalse(store.getState().test.foo);
    });
  });

  describe('with <Control.file />', () => {
    it('should update with an array of files', () => {
      const store = testCreateStore({
        testForm: formReducer('test'),
        test: modelReducer('test', { foo: [] }),
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
        store.getState().test.foo,
        [
          { name: 'first.jpg' },
          { name: 'second.jpg' },
        ]);
    });
  });

  describe('with <Control.select />', () => {
    const store = testCreateStore({
      testForm: formReducer('test'),
      test: modelReducer('test', {
        foo: 'one',
      }),
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

  describe('ignoring events with ignore prop', () => {
    const store = testCreateStore({
      test: modelReducer('test', { foo: 'bar' }),
      testForm: formReducer('test', { foo: 'bar' }),
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
    const store = testCreateStore({
      testForm: formReducer('test'),
      test: modelReducer('test', {
        foo: '',
        blur: '',
        external: '',
      }),
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

  describe('asyncValidators and asyncValidateOn property', () => {
    const reducer = formReducer('test');
    const store = testCreateStore({
      testForm: reducer,
      test: modelReducer('test', {}),
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

    it('async validation should not override sync validity', () => {
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

      input.value = '';
      TestUtils.Simulate.change(input);
      TestUtils.Simulate.blur(input);

      assert.deepEqual(
        store.getState().testForm.foo.validity,
        {
          required: false,
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
      const store = testCreateStore({
        testForm: reducer,
        test: modelReducer('test', {
          foo: '',
        }),
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
      const store = applyMiddleware(thunk)(createStore)(combineReducers({
        testForm: reducer,
        test: modelReducer('test', {
          foo: '',
        }),
      }));

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
            <Control.select model="test.foo" dynamic>
              {this.state.options.map((option, i) =>
                <option key={i} value={option} />
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
      const store = testCreateStore({
        test: modelReducer('test', { foo: 'initial' }),
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

        assert.equal(store.getState().test.foo, 'initial');

        const testValue = `${onEvent} test`;

        control.value = testValue;

        assert.equal(store.getState().test.foo, 'initial',
          'Model value should not change yet');

        TestUtils.Simulate[onEvent](control);

        assert.equal(store.getState().test.foo, testValue);
      });
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
    const reducer = modelReducer('test', { foo: '' });
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
        store.getState().test.foo,
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
        store.getState().test.foo,
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
        store.getState().test.foo,
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
      const onChangeFn = () => {};
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
        store.getState().test.foo,
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

  describe('manual focus/blur', () => {
    beforeEach(() => {
      handleFocus.clearCache();
    });

    const store = testCreateStore({
      test: modelReducer('test', { foo: 'bar' }),
      testForm: formReducer('test', { foo: 'bar' }),
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
    const store = testCreateStore({
      test: modelReducer('test', { foo: 'bar' }),
      testForm: formReducer('test', { foo: 'bar' }),
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

      assert.equal(store.getState().test.foo, 'update on change');
    });

    it('should update on blur', () => {
      input.value = 'update on blur';

      TestUtils.Simulate.blur(input);

      assert.equal(store.getState().test.foo, 'update on blur');
    });
  });
});
