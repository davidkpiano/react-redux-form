import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';
import isPristine from '../../form/is-pristine';
import updateParentForms from '../../utils/update-parent-forms';
import updateSubFields from '../../utils/update-sub-fields';

export default function setPristineActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.SET_PRISTINE) {
    return state;
  }

  const updatedField = updateField(state, localPath, {
    pristine: true,
  });

  const updatedSubFields = updateSubFields(updatedField, localPath, {
    pristine: true,
  });

  return updateParentForms(updatedSubFields, localPath, (form) => ({
    pristine: isPristine(form),
  }));
}
