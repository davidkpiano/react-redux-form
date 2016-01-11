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
});
