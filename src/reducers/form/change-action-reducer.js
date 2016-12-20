import actionTypes from '../../action-types';
import Immutable from 'immutable';
import i from 'icepick';
import identity from 'lodash/identity';
import _get from '../../utils/get';
import shallowEqual from '../../utils/shallow-equal';
import isPlainObject from 'lodash/isPlainObject';
import compact from 'lodash/compact';
import _mapValues from '../../utils/map-values';
import { createInitialState } from '../form-reducer';
import _initialFieldState from '../../constants/initial-field-state';
import updateParentForms from '../../utils/update-parent-forms';

const defaultStrategies = {
  get: _get,
  set: i.set,
  setIn: i.setIn,
  fromJS: identity,
  toJS: identity,
  remove: i.dissoc,
  initialFieldState: _initialFieldState,
  merge: i.assign,
  mergeDeep: i.merge,
  mapValues: _mapValues,
  keys: Object.keys,
};

export function createChangeActionReducer(s = defaultStrategies) {
  function updateFieldValue(field, action, parentModel = undefined) {
    const { value, removeKeys, silent, load, model } = action;

    const $form = s.get(field, ['$form']);
    const fieldState = (field && $form)
      ? $form
      : field;

    const changedFieldProps = s.fromJS({
      validated: false,
      retouched: s.get(fieldState, 'submitted')
        ? true
        : s.get(fieldState, 'retouched'),
      intents: [{ type: 'validate' }],
      pristine: silent
        ? s.get(fieldState, 'pristine')
        : false,
      initialValue: load
        ? value
        : s.get(fieldState, 'initialValue'),
    });

    if (shallowEqual(s.get(field, 'value'), value)) {
      return s.merge(field, changedFieldProps);
    }

    if (removeKeys) {
      const valueIsArray = Array.isArray(s.toJS(s.get(field, ['$form', 'value'])));
      const removeKeysArray = Array.isArray(removeKeys)
        ? removeKeys
        : [removeKeys];

      let result;

      if (valueIsArray) {
        result = [];

        s.keys(field).forEach((key) => {
          if (!!~removeKeysArray.indexOf(+key) || (key === '$form')) return;

          result[key] = s.get(field, key);
        });

        return s.set(s.fromJS(compact(result)), '$form', s.get(field, '$form'));
      }

      result = s.toJS(field);

      s.keys(field).forEach((key) => {
        if (removeKeysArray.indexOf(key) !== -1) {
          delete result[`${key}`];
        }
      });

      return s.fromJS(result);
    }

    if (!Array.isArray(value) && !isPlainObject(value) && !Immutable.Iterable.isIterable(value)) {
      return s.merge(field, s.set(changedFieldProps, 'value', value));
    }

    const updatedField = s.mapValues(s.fromJS(value), (subValue, index) => {
      // TODO: refactor
      const parentModelString = parentModel ? `${parentModel}.` : '';
      const fullModelPath = `${`${parentModelString}${model}`}`;

      const subField = s.get(field, index)
        || createInitialState(`${fullModelPath}.${index}`, subValue, {}, {}, s);

      if (s.get(subField, '$form')) {
        return updateFieldValue(subField, s.fromJS({
          model: index,
          value: subValue,
        }), fullModelPath);
      }

      if (shallowEqual(subValue, s.get(subField, 'value'))) {
        return subField;
      }

      return s.merge(subField, s.merge(changedFieldProps, s.fromJS({
        value: subValue,
        initialValue: load
          ? subValue
          : subField.initialValue,
      })));
    });

    const dirtyFormState = s.merge(s.get(field, '$form') || s.initialFieldState,
      s.set(changedFieldProps, 'retouched',
        s.get(field, 'submitted') ||
        (s.get(field, '$form') && s.get(field, ['$form', 'retouched']))
      )
    );

    return s.set(updatedField, '$form',
      s.set(dirtyFormState, 'value', value));
  }

  function getFormValue(form) {
    if (!s.get(form, '$form')) return s.get(form, 'initialValue');

    const result = s.mapValues(form, (field, key) => {
      if (key === '$form') return undefined;

      return getFormValue(field);
    });

    s.remove(result, '$form');

    return result;
  }

  return function changeActionReducer(state, action, localPath) {
    if (action.type !== actionTypes.CHANGE) return state;

    const field = s.get(state,
      localPath,
      createInitialState(action.model, s.fromJS(action.value), {}, {}, s)
    );

    const updatedField = updateFieldValue(field, action);

    if (!localPath.length) return updatedField;

    const updatedState = s.setIn(state, localPath, updatedField);

    if (action.silent) {
      return updateParentForms(updatedState, localPath, (form) => {
        const formValue = getFormValue(form);

        return s.fromJS({
          value: formValue,
          initialValue: formValue,
        });
      }, s);
    }

    return updateParentForms(updatedState, localPath, { pristine: false }, s);
  };
}

const createChangeAction = createChangeActionReducer();
export default createChangeAction;
