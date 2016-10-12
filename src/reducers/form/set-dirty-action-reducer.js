import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';
import isPristine from '../../form/is-pristine';
import updateParentForms from '../../utils/update-parent-forms';

export default function setValidityActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.SET_DIRTY && action.type !== actionTypes.CHANGE) {
    return state;
  }

  if (action.type === actionTypes.CHANGE && action.silent) {
    return state;
  }

  const newState = updateField(state, localPath, {
    pristine: false,
  }, {
    pristine: false,
  });

  return updateParentForms(newState, localPath, (form) => ({
    pristine: isPristine(form),
  }));
}
