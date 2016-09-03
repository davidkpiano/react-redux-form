import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';
import icepick from 'icepick';

export default function setValidityActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.FOCUS) {
    return state;
  }

  return updateField(state, localPath, {
    focus: true,
  }, null, (node) => {
    if (node.$form) {
      return icepick.setIn(node, ['$form', 'focus'], true);
    }

    return icepick.set(node, 'focus', true);
  });
}
