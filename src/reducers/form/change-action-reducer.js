import actionTypes from '../../action-types';
import icepick from 'icepick';
import get from '../../utils/get';
import shallowEqual from 'fbjs/lib/shallowEqual';
import isPlainObject from 'lodash/isPlainObject';
import mapValues from '../../utils/map-values';
import { initialFieldState } from '../v1-form-reducer';

function updateFieldValue(field, value) {
  let method;

  if (shallowEqual(field.value, value)) return field;

  if (Array.isArray(value)) {
    method = (val, iter) => Array.prototype.map.call(val, iter).filter(a => !!a);
  } else if (isPlainObject(value)) {
    method = (val, iter) => mapValues(val, iter);
  } else {
    return icepick.merge(field, {
      value,
      pristine: false,
      validated: false,
    });
  }

  const updatedField = method(value, (subValue, index) => {
    const subField = field[index];

    if (subField) {
      if (Object.hasOwnProperty.call(subField, '$form')) {
        return updateFieldValue(subField, subValue);
      }

      if (shallowEqual(subValue, subField.value)) {
        return subField;
      }

      return icepick.merge(subField, {
        value: subValue,
        pristine: false,
        validated: false,
      });
    }

    // Subfield did not exist or was removed
    return false;
  });

  const dirtyFormState = icepick.merge(field.$form || initialFieldState, {
    pristine: false,
    validated: false,
  });

  return icepick.set(updatedField, '$form',
    icepick.set(dirtyFormState, 'value', value));
}

export default function changeActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.CHANGE) return state;

  const field = get(state, localPath, initialFieldState);

  const updatedField = updateFieldValue(field, action.value);

  return icepick.setIn(state, localPath, updatedField);
}
