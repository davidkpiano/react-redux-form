import actionTypes from '../../action-types';
import i from 'icepick';
import get from '../../utils/get';
import isPlainObject from '../../utils/is-plain-object';
import mapValues from '../../utils/map-values';
import { createInitialState } from '../form-reducer';
import initialFieldState from '../../constants/initial-field-state';
import updateParentForms from '../../utils/update-parent-forms';
import invariant from 'invariant';

function updateFieldValue(field, action, parentModel = undefined) {
  const { value, removeKeys, silent, load, model } = action;

  const fieldState = (field && field.$form)
    ? field.$form
    : field;

  const valueIsArray = Array.isArray(value);

  const changedFieldProps = {
    validated: false,
    retouched: fieldState.submitted || fieldState.retouched,
    intents: [{ type: 'validate' }],
    pristine: silent && fieldState.pristine,
    loadedValue: (load && value) || fieldState.loadedValue,
  };

  if (removeKeys) {
    invariant(field && field.$form,
      'Unable to remove keys. ' +
      'Field for "%s" in store is not an array/object.',
      model);

    const removeKeysArray = [].concat(removeKeys);

    let result;

    if (valueIsArray) {
      result = [];

      Object.keys(field).forEach((key) => {
        if (!!~removeKeysArray.indexOf(+key) || (key === '$form')) return;

        result[key] = field[key];
      });

      return { ...i.set(result.filter((f) => f), '$form', field.$form) };
    }

    result = { ...field };

    Object.keys(field).forEach((key) => {
      if (!!~removeKeysArray.indexOf(key)) {
        delete result[`${key}`];
      }
    });

    return result;
  }

  if (!valueIsArray && !isPlainObject(value)) {
    return i.merge(field, changedFieldProps);
  }

  const updatedField = mapValues(value, (subValue, index) => {
    // TODO: refactor
    const subField = field[index]
      || createInitialState(`${`${(parentModel
        ? `${parentModel}.`
        : '')
      }${model}`}.${index}`, subValue);

    if (Object.hasOwnProperty.call(subField, '$form')) {
      return updateFieldValue(subField, {
        model: index,
        value: subValue,
      }, parentModel ? `${parentModel}.${model}` : model);
    }

    return i.merge(subField, i.assign(changedFieldProps, {
      loadedValue: load
        ? subValue
        : subField.loadedValue,
    }));
  });

  const dirtyFormState = i.merge(field.$form || initialFieldState,
    i.set(changedFieldProps, 'retouched',
      field.submitted || (field.$form && field.$form.retouched)));


  return i.set(updatedField, '$form',
    i.set(dirtyFormState, 'value', value));
}

function getFormValue(form) {
  if (form && !form.$form) {
    return typeof form.loadedValue !== 'undefined'
      ? form.loadedValue
      : form.initialValue;
  }

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
        loadedValue: formValue,
      };
    });
  }

  return updateParentForms(updatedState, localPath, { pristine: false });
}
