import {
  invertValidators,
  getValidity,
  isInvalid,
  getFormStateKey,
} from '../src/utils/index';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import mapValues from 'lodash/mapValues';
import _get from 'lodash/get';
import { assert } from 'chai';

import { actions, formReducer, utils } from '../src';

describe('utils', () => {
  describe('invertValidators()', () => {
    it('should invert the validity of a validator function', () => {
      const validator = (val) => val === 'foo';
      const inverted = invertValidators(validator);
      const error = isInvalid(getValidity(inverted, 'foo'));

      assert.isFalse(error);
    });

    it('should invert the validity of a validators map', () => {
      const validators = {
        isFoo: (val) => val === 'foo',
        isBar: (val) => val === 'bar',
      };
      const inverted = invertValidators(validators);
      const error = isInvalid(getValidity(inverted, 'foo'));

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
      assert.isFunction(utils.getFieldFromState);
    });

    context('standard form', () => {
      it('finds the field in state', () => {
        const reducer = formReducer('person');
        const personForm = reducer(undefined, actions.change('person.name', 'john'));

        const field = utils.getFieldFromState({ personForm }, 'person.name');
        assert.strictEqual(personForm.fields.name, field);
      });
    });

    context('nested form', () => {
      it('finds the field in state', () => {
        const reducer = formReducer('app.car');
        const carForm = reducer(undefined, actions.change('app.car.make', 'mazda'));

        const field = utils.getFieldFromState({ carForm }, 'app.car.make');
        assert.strictEqual(carForm.fields.make, field);
      });
    });

    context('nested field', () => {
      it('finds the field in state', () => {
        const reducer = formReducer('district.library');
        const libraryForm = reducer(undefined, actions.change('district.library.hours.open', 8));

        const field = utils.getFieldFromState({ libraryForm }, 'district.library.hours.open');
        assert.strictEqual(libraryForm.fields['hours.open'], field);
      });
    });
  });

  describe('getFormStateKey()', () => {
    const store = applyMiddleware(thunk)(createStore)(combineReducers({
      firstForm: formReducer('first'),
      deep: combineReducers({
        secondForm: formReducer('second'),
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
  });
});
