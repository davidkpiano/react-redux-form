import { actionTypes } from '../lib/index';
import { assert } from 'chai';

describe('action types', () => {
  let _actionTypes = Object.keys(actionTypes).map((key) => actionTypes[key]);

  it('should be present and importable from the index file', () => {
    assert.ok(_actionTypes.length > 0,
      'there should be at least one action type exported');
  });
});
