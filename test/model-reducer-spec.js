import { assert } from 'chai';
import { actions, modelReducer } from '../src';

describe('modelReducer()', () => {
  it('should create a reducer given a model', () => {
    const reducer = modelReducer('test');

    assert.isFunction(reducer);
  });

  it('should create a reducer with initial state given a model and initial state', () => {
    const reducer = modelReducer('test', { foo: 'bar' });

    assert.deepEqual(
      reducer(undefined, {}),
      { foo: 'bar' });
  });

  it('should ignore external actions', () => {
    const model = { foo: 'bar' };
    const reducer = modelReducer('test', model);
    const externalAction = {
      type: 'EXTERNAL_ACTION',
    };

    assert.deepEqual(
      reducer(undefined, externalAction),
      model);
  });

  it('should ignore actions that are outside of the model', () => {
    const model = { foo: 'bar' };
    const reducer = modelReducer('test', model);

    assert.deepEqual(
      reducer(undefined, actions.change('outside', 'value')),
      model);

    assert.deepEqual(
      reducer(undefined, actions.change('external.value', 'value')),
      model);
  });

  it('should update the state given a change action', () => {
    const model = { foo: 'bar', one: 'two' };
    const reducer = modelReducer('test', model);

    assert.deepEqual(
      reducer(undefined, actions.change('test.foo', 'new')),
      { foo: 'new', one: 'two' });
  });

  it('should be able to handle models with depth > 1', () => {
    const model = { bar: [1, 2, 3] };
    const deepReducer = modelReducer('test.foo');
    const shallowReducer = (state = { original: 'untouched', foo: model }, action) => ({
      ...state,
      foo: deepReducer(state.foo, action),
    });

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

  it('should handle model at deep state path', () => {
    const reducer = modelReducer('forms.test');

    assert.deepEqual(
      reducer(undefined, actions.change('forms.test.foo', 'new')),
      { foo: 'new' }
    );

    assert.deepEqual(
      reducer(undefined, actions.change('forms.different.foo', 'new')),
      {},
      'should only change when base path is equal');
  });

  it('should reset a model to its initial state', () => {
    const initialState = {
      simple: 123,
      foo: [],
      meta: { bar: [] },
    };

    const reducer = modelReducer('test', initialState);

    const changedState = reducer(undefined, actions.change('test', {
      simple: 999,
      foo: [1, 2, 3],
      meta: { bar: [1, 2, 3], baz: 'new field' },
    }));

    assert.deepEqual(
      reducer(changedState, actions.reset('test')),
      initialState
    );
  });
});
