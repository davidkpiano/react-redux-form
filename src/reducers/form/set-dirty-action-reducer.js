import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';
import isPristine from '../../form/is-pristine';
import updateParentForms from '../../utils/update-parent-forms';
import updateSubFields from '../../utils/update-sub-fields';

export default function setDirtyActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.SET_DIRTY && action.type !== actionTypes.CHANGE) {
    return state;
  }

  if (action.type === actionTypes.CHANGE && action.silent) {
    return state;
  }

  const updatedField = updateField(state, localPath, {
    pristine: false,
  });

  const updatedSubFields = updateSubFields(updatedField, localPath, {
    pristine: false,
  });

  return updateParentForms(updatedSubFields, localPath, (form) => ({
    pristine: isPristine(form),
  }));
}
