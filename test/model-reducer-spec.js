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
});
