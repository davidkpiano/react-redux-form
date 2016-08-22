import map from '../../utils/map';

import fieldActions from '../../actions/field-actions';
import actionTypes from '../../action-types';
import isPlainObject from 'lodash/isPlainObject';
import mapValues from '../../utils/map-values';
import inverse from '../../utils/inverse';
import updateField from '../../utils/update-field';
import toPath from '../../utils/to-path';
import isValid from '../../form/is-valid';
import isValidityValid from '../../utils/is-validity-valid';
import isValidityInvalid from '../../utils/is-validity-invalid';

import icepick from 'icepick';

export default function setValidityActionReducer(state, action, localPath) {
  if (action.type === actionTypes.SET_FIELDS_VALIDITY) {
    return map(action.fieldsValidity, (fieldValidity, field) =>
        fieldActions.setValidity(field, fieldValidity, action.options)
      ).reduce((accState, subAction) => setValidityActionReducer(
        accState,
        subAction,
        toPath(subAction.model)), state);
  }

  if (action.type === actionTypes.SET_VALIDATING) {
    return updateField(state, localPath, {
      validating: action.validating,
      validated: !action.validating,
    });
  }

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
    validating: false,
    validated: true,
    valid: isErrors
      ? !isValidityInvalid(validity)
      : isValidityValid(validity),
  }, null, (node) => {
    if (node.$form) {
      return icepick.setIn(node, ['$form', 'valid'], isValid(node));
    }

    return icepick.set(node, 'valid', isValid(node));
  });
}
