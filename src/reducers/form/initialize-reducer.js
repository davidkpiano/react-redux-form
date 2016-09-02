import { createInitialState } from '../form-reducer';
import icepick from 'icepick';
import get from '../../utils/get';

function initializeReducer(state, action, localPath) {
  if (!get(state, localPath)) {
    return icepick.set(state, localPath[0], createInitialState(
      state.$form.model,
      icepick.setIn({}, localPath, null))[localPath[0]]);
  }

  return state;
}

export default initializeReducer;
