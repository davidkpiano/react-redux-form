import actionTypes from '../../action-types';
import i from 'icepick';
import get from '../../utils/get';
import shallowEqual from '../../utils/shallow-equal';
import isPlainObject from 'lodash/isPlainObject';
import compact from 'lodash/compact';
import mapValues from '../../utils/map-values';
import { createInitialState } from '../form-reducer';
import initialFieldState from '../../constants/initial-field-state';
import updateParentForms from '../../utils/update-parent-forms';

function updateFieldValue(field, action) {
  const { value, removeKeys, silent, model } = action;

  const changedFieldProps = {
    validated: false,
    retouched: field.submitted
      ? true
      : field.retouched,
    intents: [{ type: 'validate' }],
  };

  if (shallowEqual(field.value, value)) {
    return i.merge(field, changedFieldProps);
  }

  if (silent) {
    return i.merge(field, {
      value,
      initialValue: value,
    });
  }

  if (removeKeys) {
    const valueIsArray = Array.isArray(field.$form.value);
    const removeKeysArray = Array.isArray(removeKeys)
      ? removeKeys
      : [removeKeys];

    let result;

    if (valueIsArray) {
      result = [];

      Object.keys(field).forEach((key) => {
        if (!!~removeKeysArray.indexOf(+key) || (key === '$form')) return;

        result[key] = field[key];
      });

      return i.set(compact(result), '$form', field.$form);
    }

    result = { ...field };

    Object.keys(field).forEach((key) => {
      if (!!~removeKeysArray.indexOf(key)) {
        delete result[`${key}`];
      }
    });

    return result;
  }

  if (!Array.isArray(value) && !isPlainObject(value)) {
    return i.merge(field, i.set(changedFieldProps, 'value', value));
  }

  const updatedField = mapValues(value, (subValue, index) => {
    const subField = field[index] || createInitialState(`${model}.${index}`, subValue);

    if (Object.hasOwnProperty.call(subField, '$form')) {
      return updateFieldValue(subField, {
        model: index,
        value: subValue,
      });
    }

    if (shallowEqual(subValue, subField.value)) {
      return subField;
    }

    return i.merge(subField, i.set(changedFieldProps, 'value', subValue));
  });

  const dirtyFormState = i.merge(field.$form || initialFieldState,
    i.set(changedFieldProps, 'retouched',
      field.submitted || (field.$form && field.$form.retouched)));


  return i.set(updatedField, '$form',
    i.set(dirtyFormState, 'value', value));
}

function getFormValue(form) {
  if (!form.$form) return form.initialValue;

  const result = mapValues(form, (field, key) => {
    if (key === '$form') return undefined;

    return getFormValue(field);
  });

  delete result.$form;

  return result;
}

export default function changeActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.CHANGE) return state;

  const field = get(state, localPath, createInitialState(action.model, action.value));

  const updatedField = updateFieldValue(field, action);

  if (!localPath.length) return updatedField;

  const updatedState = i.setIn(state, localPath, updatedField);

  if (action.silent) {
    return updateParentForms(updatedState, localPath, (form) => {
      const formValue = getFormValue(form);

      return {
        value: formValue,
        initialValue: formValue,
      };
    });
  }

  return updatedState;
}
