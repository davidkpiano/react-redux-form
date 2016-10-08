import map from '../../utils/map';

import fieldActions from '../../actions/field-actions';
import actionTypes from '../../action-types';
import isPlainObject from 'lodash/isPlainObject';
import mapValues from '../../utils/map-values';
import inverse from '../../utils/inverse';
import updateField from '../../utils/update-field';
import toPath from '../../utils/to-path';
import isValid, { fieldsValid } from '../../form/is-valid';
import isValidityValid from '../../utils/is-validity-valid';
import isValidityInvalid from '../../utils/is-validity-invalid';
import updateParentForms from '../../utils/update-parent-forms';
import get from '../../utils/get';

export default function setValidityActionReducer(state, action, localPath) {
  if (action.type === actionTypes.SET_FIELDS_VALIDITY) {
    return map(action.fieldsValidity, (fieldValidity, field) =>
        fieldActions.setValidity(field, fieldValidity, action.options)
      ).reduce((accState, subAction) => setValidityActionReducer(
        accState,
        subAction,
        localPath.concat(toPath(subAction.model))), state);
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

  const field = get(state, localPath);

  // If the field is a form, its validity is
  // also based on whether its fields are all valid.
  const areFieldsValid = (field && field.$form)
    ? fieldsValid(field)
    : true;

  const newState = updateField(state, localPath, {
    [isErrors ? 'errors' : 'validity']: validity,
    [isErrors ? 'validity' : 'errors']: inverseValidity,
    validating: false,
    validated: true,
    valid: areFieldsValid && (isErrors
      ? !isValidityInvalid(validity)
      : isValidityValid(validity)),
  });

  return updateParentForms(newState, localPath, (form) => ({
    valid: isValid(form),
  }));
}
