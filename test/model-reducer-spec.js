import { assert } from 'chai';
import should from 'should';

import { actions, createModelReducer } from '../src';

describe('createModelReducer()', () => {
  it('should create a reducer given a model', () => {
    const reducer = createModelReducer('test');

    assert.isFunction(reducer);
  });

  it('should create a reducer with initial state given a model and initial state', () => {
    const reducer = createModelReducer('test', { foo: 'bar' });

    assert.deepEqual(
      reducer(undefined, {}),
      { foo: 'bar' });
  });

  it('should ignore external actions', () => {
    const model = { foo: 'bar' };
    const reducer = createModelReducer('test', model);
    const externalAction = {
      type: 'EXTERNAL_ACTION'
    };

    assert.deepEqual(
      reducer(undefined, externalAction),
      model);
  });

  it('should ignore actions that are outside of the model', () => {
    const model = { foo: 'bar' };
    const reducer = createModelReducer('test', model);

    assert.deepEqual(
      reducer(undefined, actions.change('outside', 'value')),
      model);

    assert.deepEqual(
      reducer(undefined, actions.change('external.value', 'value')),
      model);
  });

  it('should return an immutable state', () => {
    const initialState = { foo: 'bar' };
    const reducer = createModelReducer('test', initialState);
    const result = reducer(undefined, {});

    result.foo = 'changed';

    assert.deepEqual(
      result,
      initialState);
  });
});
