import { assert } from 'chai';
import { actionTypes } from '../src';

describe('action types', () => {
  const testActionTypes = Object.keys(actionTypes).map(key => actionTypes[key]);

  it('should be present and importable from the index file', () => {
    assert.ok(testActionTypes.length > 0,
      'there should be at least one action type exported');
  });
});
