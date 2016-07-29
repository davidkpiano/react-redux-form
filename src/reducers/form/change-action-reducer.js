import actionTypes from '../../action-types';
import icepick from 'icepick';
import get from '../../utils/get';
import shallowEqual from 'fbjs/lib/shallowEqual';
import isPlainObject from 'lodash/isPlainObject';
import compact from 'lodash/compact';
import mapValues from '../../utils/map-values';
import { initialFieldState } from '../v1-form-reducer';

function updateFieldValue(field, action) {
  let method;
  const { value, removeKeys } = action;

  if (shallowEqual(field.value, value)) return field;

  if (removeKeys) {
    const result = [];

    Object.keys(field).forEach((key) => {
      if (!!~removeKeys.indexOf(+key) || key === '$form') return;

      result[key] = field[key];
    });

    return {...compact(result), $form: field.$form};
  }

  if (Array.isArray(value)) {
    method = (val, iter) => Array.prototype.map.call(val, iter).filter(a => !!a);
  } else if (isPlainObject(value)) {
    method = (val, iter) => mapValues(val, iter);
  } else {
    return icepick.merge(field, {
      value,
      pristine: false,
      validated: false,
      retouched: field.submitted
        ? true
        : field.retouched,
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
        retouched: field.submitted
          ? true
          : subField.retouched,
      });
    }

    // Subfield did not exist or was removed
    return false;
  });

  const dirtyFormState = icepick.merge(field.$form || initialFieldState, {
    pristine: false,
    validated: false,
    retouched: field.submitted
      ? true
      : (field.$form || initialFieldState).retouched,
  });

  return icepick.set(updatedField, '$form',
    icepick.set(dirtyFormState, 'value', value));
}

export default function changeActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.CHANGE) return state;

  const field = get(state, localPath, initialFieldState);

  const updatedField = updateFieldValue(field, action);

  if (!localPath.length) return updatedField;

  return icepick.setIn(state, localPath, updatedField);
}
