import { assert } from 'chai';
import should from 'should';

import { actions, createFormReducer } from '../lib';

describe('createFormReducer()', () => {
  it('should create a reducer given a model', () => {
    const reducer = createFormReducer('test');

    assert.isFunction(reducer);
  });
});
