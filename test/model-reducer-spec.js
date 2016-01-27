import { assert } from 'chai';
import should from 'should';
import { compose } from 'redux';

import { actions, createModelReducer } from '../lib';

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

  it('should update the state given a change action', () => {
    const model = { foo: 'bar', one: 'two' };
    const reducer = createModelReducer('test', model);

    assert.deepEqual(
      reducer(undefined, actions.change('test.foo', 'new')),
      { foo: 'new', one: 'two' });
  });

  it('should be able to handle models with depth > 1', () => {
    const model = { 'bar' : [1, 2, 3] };
    const deepReducer = createModelReducer('test.foo');
    const shallowReducer = (state = { original: 'untouched', foo: model }, action) => {
      return {
        ...state,
        foo: deepReducer(state.foo, action)
      };
    }

    assert.deepEqual(
      shallowReducer(undefined, {}),
      { original: 'untouched', foo: model });

    assert.deepEqual(
      shallowReducer(undefined, actions.change('test.foo', 'something else')),
      { original: 'untouched', foo: 'something else' });

    assert.deepEqual(
      shallowReducer(undefined, actions.change('test.foo.bar', 'baz')),
      { original: 'untouched', foo: { bar: 'baz' } });

    assert.deepEqual(
      shallowReducer(undefined, actions.change('test.foo.bar[1]', 'two')),
      { original: 'untouched', foo: { bar: [1, 'two', 3] } });
  });
});
