import {
  invertValidators,
  getValidity,
  isInvalid,
} from '../src/utils/index';
import mapValues from 'lodash/mapValues';
import _get from 'lodash/get';
import { assert } from 'chai';

import { utils } from '../src/index';

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
  });
});
