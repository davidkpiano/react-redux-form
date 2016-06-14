import actionTypes from '../../action-types';
import isPlainObject from 'lodash/isPlainObject';
import mapValues from '../../utils/map-values';
import inverse from '../../utils/inverse';
import updateField from '../../utils/update-field';

export default function setValidityActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.FOCUS) {
    return state;
  }

  return updateField(state, localPath, {
    focus: true,
  });
}
