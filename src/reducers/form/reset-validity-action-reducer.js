import map from 'lodash/map';

import fieldActions from '../../actions/field-actions';
import actionTypes from '../../action-types';
import isPlainObject from 'lodash/isPlainObject';
import mapValues from '../../utils/map-values';
import inverse from '../../utils/inverse';
import updateField from '../../utils/update-field';
import { initialFieldState } from '../v1-form-reducer';

export default function resetValidityActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.RESET_VALIDITY) {
    return state;
  }

  return updateField(state, localPath, {
    validity: initialFieldState.validity,
    errors: initialFieldState.errors,
  });
}
