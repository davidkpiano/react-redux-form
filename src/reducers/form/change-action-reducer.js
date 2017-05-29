import actionTypes from '../../action-types';
import i from 'icepick';
import get from '../../utils/get';
import shallowEqual from '../../utils/shallow-equal';
import isPlainObject from '../../utils/is-plain-object';
import mapValues from '../../utils/map-values';
import { createInitialState } from '../form-reducer';
import initialFieldState from '../../constants/initial-field-state';
import assocIn from '../../utils/assoc-in';
import getFormValue from '../../utils/get-form-value';
import invariant from 'invariant';

function updateFieldValue(field, action, parentModel = undefined) {
  const { value, removeKeys, silent, load, model, external } = action;

  const fieldState = (field && field.$form)
    ? field.$form
    : field;

  const changedFieldProps = {
    validated: false,
    retouched: fieldState.submitted
      ? true
      : fieldState.retouched,
    // If change originated from Control component (not externally),
    // then there is no need to remind Control to validate itself.
    intents: external ? [{ type: 'validate' }] : [],
    pristine: silent
      ? fieldState.pristine
      : false,
    value,
    loadedValue: load
      ? value
      : fieldState.loadedValue,
  };

  if (shallowEqual(field.value, value)) {
    return i.merge(field, changedFieldProps);
  }

  if (removeKeys) {
    invariant(field && field.$form,
      'Unable to remove keys. ' +
      'Field for "%s" in store is not an array/object.',
      model);

    const valueIsArray = Array.isArray(field.$form.value);
    const removeKeysArray = Array.isArray(removeKeys)
      ? removeKeys
      : [removeKeys];

    let result;

    if (valueIsArray) {
      result = [];


      Object.keys(field).forEach((key) => {
        if (!!~removeKeysArray.indexOf(+key) || (key === '$form')) return;

        result[key] = { ...field[key] };
      });

      const finalResult = { ...result
        .filter((f) => f)
        .map((subField, index) => ({
          ...subField,
          model: `${model}.${index}`,
        })),
      };

      finalResult.$form = field.$form;

      return finalResult;
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
        load,
      }, parentModel ? `${parentModel}.${model}` : model);
    }

    if (shallowEqual(subValue, subField.value)) {
      return subField;
    }

    return i.merge(subField, i.assign(changedFieldProps, {
      value: subValue,
      loadedValue: load
        ? subValue
        : subField.loadedValue,
    }));
  });

  const dirtyFormState = i.merge(field.$form || initialFieldState,
    i.set(changedFieldProps, 'retouched',
      field.submitted || (field.$form && field.$form.retouched)));

  return i.set(updatedField, '$form', dirtyFormState);
}

export default function changeActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.CHANGE) return state;

  const field = get(state, localPath, createInitialState(action.model, action.value));

  const updatedField = updateFieldValue(field, action);

  if (!localPath.length) return updatedField;

  const updatedState = assocIn(state, localPath, updatedField, (form) => {
    if (!form.$form) return form;

    const formValue = getFormValue(form);

    const formUpdates = {
      ...form.$form,
      value: formValue,
    };

    if (action.silent) {
      formUpdates.loadedValue = formValue;
    } else {
      formUpdates.pristine = false;
    }

    return {
      ...form,
      $form: formUpdates,
    };
  });

  return updatedState;
}
