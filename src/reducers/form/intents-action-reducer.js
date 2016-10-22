import actionTypes from '../../action-types';
import updateField from '../../utils/update-field';

export default function intentsActionReducer(state, action, localPath) {
  if (action.type !== actionTypes.CLEAR_INTENTS) {
    return state;
  }

  return updateField(state, localPath, {
    intents: [],
  });
}
