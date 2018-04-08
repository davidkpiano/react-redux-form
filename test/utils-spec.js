import invertValidators from '../src/utils/invert-validators';
import getValidity from '../src/utils/get-validity';
import isValidityInvalid from '../src/utils/is-validity-invalid';
import { getFormStateKey as _getFormStateKey, clearGetFormCache } from '../src/utils/get-form';
import getFieldFromState from '../src/utils/get-field-from-state';
import { createStore, combineReducers as _combineReducers } from 'redux';
import { combineReducers as combineReducersImmutable } from 'redux-immutable';
import mapValues from 'lodash/mapValues';
import _get from 'lodash/get';
import { assert } from 'chai';

import { defaultTestContexts } from './utils';

import {
  actions as _actions,
  formReducer as _formReducer,
  getField,
  getModel,
  combineForms,
} from '../src';
import {
  actions as immutableActions,
  formReducer as immutableFormReducer,
  getFormStateKey as immutableGetFormStateKey,
} from '../immutable';

const testContexts = {
  standard: {
    ...defaultTestContexts.standard,
    actions: _actions,
    formReducer: _formReducer,
    combineReducers: _combineReducers,
    getFormStateKey: _getFormStateKey,
  },
  immutable: {
    ...defaultTestContexts.immutable,
    actions: immutableActions,
    formReducer: immutableFormReducer,
    combineReducers: combineReducersImmutable,
    getFormStateKey: immutableGetFormStateKey,
  },
};

Object.keys(testContexts).forEach((testKey) => {
  const testContext = testContexts[testKey];
  const actions = testContext.actions;
  const formReducer = testContext.formReducer;
  const combineReducers = testContext.combineReducers;
  const getFormStateKey = testContext.getFormStateKey;
  const getInitialState = testContext.getInitialState;

  describe(`utils (${testKey} context)`, () => {
    describe('invertValidators()', () => {
      it('should invert the validity of a validator function', () => {
        const validator = (val) => val === 'foo';
        const inverted = invertValidators(validator);
        const error = isValidityInvalid(getValidity(inverted, 'foo'));

        assert.isFalse(error);
      });

      it('should invert the validity of a validators map', () => {
        const validators = {
          isFoo: (val) => val === 'foo',
          isBar: (val) => val === 'bar',
        };
        const inverted = invertValidators(validators);
        const error = isValidityInvalid(getValidity(inverted, 'foo'));

        assert.isTrue(error);
      });

      it('should give equivalent results', () => {
        const validators = {
          foo: (val) => val === 'testing foo',
          bar: {
            one: (val) => val && val.length >= 1,
            two: (val) => val && val.length >= 2,
          },
        };
        const inverted = invertValidators(validators);

        const value = {
          foo: 'testing foo',
          bar: '123',
        };

        const fieldsValidity = mapValues(inverted, (validator, field) => {
          const fieldValue = field
            ? _get(value, field)
            : value;

          const fieldValidity = getValidity(validator, fieldValue);

          return fieldValidity;
        });

        assert.deepEqual(fieldsValidity, {
          foo: false,
          bar: {
            one: false,
            two: false,
          },
        });
      });
    });

    describe('getValidity()', () => {
      it('should handle an error validator that returns a string', () => {
        const validators = { test: (val) => !val && 'Required' };

        assert.deepEqual(
          getValidity(validators, ''),
          { test: 'Required' });
      });
    });

    describe('getFieldFromState()', () => {
      it('should exist', () => {
        assert.isFunction(getFieldFromState);
      });

      context('standard form', () => {
        it('finds the field in state', () => {
          const reducer = formReducer('person');
          const personForm = reducer(undefined, actions.change('person.name', 'john'));

          const field = getFieldFromState({ personForm }, 'person.name');
          assert.strictEqual(personForm.name, field);
        });
      });

      context('nested form', () => {
        it('finds the field in state', () => {
          const reducer = formReducer('app.car');
          const carForm = reducer(undefined, actions.change('app.car.make', 'mazda'));

          const field = getFieldFromState({ carForm }, 'app.car.make');
          assert.strictEqual(carForm.make, field);
        });
      });

      context('nested field', () => {
        it('finds the field in state', () => {
          const reducer = formReducer('district.library');
          const libraryForm = reducer(undefined, actions.change('district.library.hours.open', 8));

          const field = getFieldFromState({ libraryForm }, 'district.library.hours.open');
          assert.strictEqual(libraryForm.hours.open, field);
        });
      });
    });

    describe('getFormStateKey()', () => {
      context('explicit formReducers', () => {
        const store = createStore(combineReducers({
          firstForm: formReducer('first'),
          deep: combineReducers({
            secondForm: formReducer('second', getInitialState({
              nested: { foo: 'bar' },
            })),
            deeper: combineReducers({
              thirdForm: formReducer('third'),
            }),
          }),
        }));

        it('should find a shallow form reducer state key', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'first'),
            'firstForm');
        });

        it('should find a shallow form reducer state key with deep model', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'first.anything'),
            'firstForm');
        });

        it('should find a deep form reducer state key', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'second'),
            'deep.secondForm');
        });

        it('should find a deep form reducer state key with deep model', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'second.anything'),
            'deep.secondForm');
        });

        it('should find a deeper form reducer state key', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'third'),
            'deep.deeper.thirdForm');
        });

        it('should find a deeper form reducer state key with deep model', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'third.anything'),
            'deep.deeper.thirdForm');
        });

        it('should find a nested form reducer', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'second.nested.foo'),
            'deep.secondForm.nested');
        });
      });

      context('combined formReducer', () => {
        const store = createStore(combineForms({
          first: {},
          deep: {
            second: {
              nested: { foo: 'bar' },
            },
            deeper: {
              third: {},
            },
          },
          array: {
            simple: [1, 2, 3],
            empty: [],
          },
        }));

        it('should find a shallow form reducer state key', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'first'),
            'forms.first');
        });

        it('should find a shallow form reducer state key with deep model', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'first.anything'),
            'forms.first');
        });

        it('should find a deep form reducer state key', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'deep.second'),
            'forms.deep.second');
        });

        it('should find a deep form reducer state key with deep model', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'deep.second.anything'),
            'forms.deep.second');
        });

        it('should find a deeper form reducer state key', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'deep.deeper.third'),
            'forms.deep.deeper.third');
        });

        it('should find a deeper form reducer state key with deep model', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'deep.deeper.third.anything'),
            'forms.deep.deeper.third');
        });

        it('should find a nested form reducer', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'deep.second.nested.foo'),
            'forms.deep.second.nested');
        });

        it('should find an array form reducer state key', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'array.simple[0]'),
            'forms.array.simple');
        });
      });

      context('state with empty key', () => {
        const emptyReducer = function () { return {}; };
        const store = createStore(combineReducers({
          '': emptyReducer,
          firstForm: formReducer('first'),
          deep: combineReducers({
            secondForm: formReducer('second', getInitialState({
              nested: { foo: 'bar' },
            })),
            deeper: combineReducers({
              thirdForm: formReducer('third'),
            }),
          }),
        }));

        it('should find a shallow form reducer state key', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'first'),
            'firstForm');
        });

        it('should find a shallow form reducer state key with deep model', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'first.anything'),
            'firstForm');
        });

        it('should find a deep form reducer state key', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'second'),
            'deep.secondForm');
        });

        it('should find a deep form reducer state key with deep model', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'second.anything'),
            'deep.secondForm');
        });

        it('should find a deeper form reducer state key', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'third'),
            'deep.deeper.thirdForm');
        });

        it('should find a deeper form reducer state key with deep model', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'third.anything'),
            'deep.deeper.thirdForm');
        });

        it('should find a nested form reducer', () => {
          assert.equal(
            getFormStateKey(store.getState(), 'second.nested.foo'),
            'deep.secondForm.nested');
        });
      });
    });

    describe('getField()', () => {
      beforeEach(() => clearGetFormCache());

      it('should exist', () => {
        assert.isFunction(getField);
      });

      const store = createStore(combineForms({
        test: {
          foo: 'foo',
          deep: {
            bar: 'bar',
          },
        },
      }));

      it('should find a field from a store', () => {
        assert.containSubset(getField(store.getState(), 'test.foo'), {
          model: 'test.foo',
        });
      });

      it('should find a deep field from a store', () => {
        assert.containSubset(getField(store.getState(), 'test.deep.bar'), {
          model: 'test.deep.bar',
        });
      });

      it('should find a nested form from a store', () => {
        assert.containSubset(getField(store.getState(), 'test.deep'), {
          model: 'test.deep',
        });
      });
    });

    describe('getModel', () => {
      it('should exist', () => {
        assert.isFunction(getModel);
      });

      const store = createStore(combineForms({
        test: {
          foo: 'foo',
          deep: {
            bar: 'bar',
          },
        },
      }));

      it('should find a model from a store', () => {
        assert.equal(
          getModel(store.getState(), 'test.foo'),
          'foo');
      });

      it('should find a deep model from a store', () => {
        assert.equal(
          getModel(store.getState(), 'test.deep.bar'),
          'bar');
      });

      it('should work with bracket notation', () => {
        assert.equal(
          getModel(store.getState(), 'test.deep["bar"]'),
          'bar');

        assert.equal(
          getModel(store.getState(), 'test["deep"].bar'),
          'bar');

        assert.equal(
          getModel(store.getState(), 'test["deep"]["bar"]'),
          'bar');
      });

      it('should find a complex model from a store', () => {
        assert.deepEqual(
          getModel(store.getState(), 'test.deep'),
          { bar: 'bar' });
      });

      it('should ignore stray periods', () => {
        assert.equal(
          getModel(store.getState(), 'test.foo.'),
          'foo');
      });

      it('should ignore ending empty brackets', () => {
        assert.equal(
          getModel(store.getState(), 'test.foo[]'),
          'foo');
      });

      it('should work when given a number index as path', () => {
        const arrayStore = createStore(combineForms([
          { foo: 'foo' },
        ]));

        assert.deepEqual(
          getModel(arrayStore.getState(), 0),
          { foo: 'foo' });
      });

      it('should work with an array path', () => {
        assert.equal(
          getModel(store.getState(), ['test', 'foo']),
          'foo');

        assert.equal(
          getModel(store.getState(), ['test', 'deep', 'bar']),
          'bar');
      });
    });
  });
});
