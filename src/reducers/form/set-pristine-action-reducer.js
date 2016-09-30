import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';
import isPristine from '../../form/is-pristine';
import updateParentForms from '../../utils/update-parent-forms';

export default function setPristineActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.SET_PRISTINE) {
    return state;
  }

  const updatedField = updateField(state, localPath, {
    pristine: true,
  }, {
    pristine: true,
  });

  return updateParentForms(updatedField, localPath, (form) => ({
    pristine: isPristine(form),
  }));
}
