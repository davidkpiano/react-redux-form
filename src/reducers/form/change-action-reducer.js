import actionTypes from '../../action-types';
import icepick from 'icepick';
import get from '../../utils/get';
import shallowEqual from '../../utils/shallow-equal';
import isPlainObject from 'lodash/isPlainObject';
import compact from 'lodash/compact';
import mapValues from '../../utils/map-values';
import { initialFieldState, createInitialState } from '../form-reducer';


function updateFieldValue(field, action) {
  const { value, removeKeys, silent, model } = action;

  const changedFieldProps = {
    pristine: false,
    validated: false,
    retouched: field.submitted
      ? true
      : field.retouched,
  };

  if (shallowEqual(field.value, value)) {
    return icepick.merge(field, changedFieldProps);
  }

  if (silent) return icepick.set(field, 'value', value);

  if (removeKeys) {
    const result = [];

    Object.keys(field).forEach((key) => {
      if (!!~removeKeys.indexOf(+key) || key === '$form') return;

      result[key] = field[key];
    });

    return { ...compact(result), $form: field.$form };
  }

  if (!Array.isArray(value) && !isPlainObject(value)) {
    return icepick.merge(field, {
      value,
      ...changedFieldProps,
    });
  }

  const updatedField = mapValues(value, (subValue, index) => {
    const subField = field[index] || createInitialState(`${model}.${index}`, subValue);

    if (Object.hasOwnProperty.call(subField, '$form')) {
      return updateFieldValue(subField, subValue);
    }

    if (shallowEqual(subValue, subField.value)) {
      return subField;
    }

    return icepick.merge(subField, {
      value: subValue,
      ...changedFieldProps,
    });
  });

  const dirtyFormState = icepick.merge(field.$form || initialFieldState, {
    ...changedFieldProps,
    retouched: field.submitted
      ? true
      : field.$form && field.$form.retouched,
  });

  return icepick.set(updatedField, '$form',
    icepick.set(dirtyFormState, 'value', value));
}

export default function changeActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.CHANGE) return state;

  const field = get(state, localPath, createInitialState(action.model, action.value));

  const updatedField = updateFieldValue(field, action);

  if (!localPath.length) return updatedField;

  return icepick.setIn(state, localPath, updatedField);
}
