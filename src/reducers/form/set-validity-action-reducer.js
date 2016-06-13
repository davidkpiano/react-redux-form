import actionTypes from '../../action-types';
import isPlainObject from 'lodash/isPlainObject';
import mapValues from '../../utils/map-values';
import inverse from '../../utils/inverse';
import updateField from '../../utils/update-field';

export default function setValidityActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.SET_VALIDITY
    && action.type !== actionTypes.SET_ERRORS
  ) {
    return state;
  }

  const isErrors = action.type === actionTypes.SET_ERRORS;
  const validity = isErrors ? action.errors : action.validity;

  const inverseValidity = isPlainObject(validity)
    ? mapValues(validity, inverse)
    : !validity;

  return updateField(state, localPath, {
    [isErrors ? 'errors' : 'validity']: validity,
    [isErrors ? 'validity' : 'errors']: inverseValidity,
    validated: true,
  });
}
