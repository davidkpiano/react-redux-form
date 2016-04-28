import { assert } from 'chai';
import { combineReducers } from 'redux';
import { modelFormReducer, modelForm, actions } from '../src';

describe('model form reducer', () => {
  const initialState = { foo: 'bar' };

  it('modelFormReducer should exist as a function', () => {
    assert.ok(modelFormReducer);
    assert.isFunction(modelFormReducer);
  });

  it('should return a reducer function', () => {
    assert.isFunction(modelFormReducer('test', {}));
  });

  it('should produce the combined result of model and form reducers', () => {
    const reducer = modelFormReducer('test', initialState);
    const actual = reducer(undefined, actions.change('test.model.foo', 'test'));

    assert.deepEqual(
      actual.model,
      { foo: 'test' });

    assert.ok(actual.form.fields.foo);

    assert.containSubset(
      actual.form.fields.foo,
      {
        pristine: false,
      });
  });
});

describe('modelForm()', () => {
  const initialState = { foo: 'bar' };

  it('modelForm should exist as a function', () => {
    assert.ok(modelForm);
    assert.isFunction(modelForm);
  });

  it('should return an object with a single model property', () => {
    const obj = modelForm('test', initialState);

    assert.isObject(obj);

    assert.property(obj, 'test');

    assert.isFunction(obj.test);
  });

  it('the model property should be a modelFormReducer', () => {
    const expectedReducer = modelFormReducer('test', initialState);

    const obj = modelForm('test', initialState);
    const reducer = combineReducers(obj);

    const actual = reducer(undefined, actions.change('test.model.foo', 'test'));
    const expected = expectedReducer(undefined, actions.change('test.model.foo', 'test'));

    assert.deepEqual(actual.test, expected);
  });
});
