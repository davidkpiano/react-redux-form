import actionTypes from '../action-types';
import partition from '../utils/partition';
import isPlainObject from '../utils/is-plain-object';
import { trackable } from '../utils/track';

import NULL_ACTION from '../constants/null-action';

const batch = trackable((model, actions) => {
  const dispatchableActions = actions.filter((action) => !!action);

  if (!dispatchableActions.length) return NULL_ACTION;

  if (dispatchableActions.length && dispatchableActions.every(isPlainObject)) {
    if (dispatchableActions.length === 1) {
      return dispatchableActions[0];
    }

    return {
      type: actionTypes.BATCH,
      model,
      actions: dispatchableActions,
    };
  }

  const [plainActions, actionThunks] = partition(dispatchableActions,
    (action) => typeof action !== 'function');

  if (!actionThunks.length) {
    if (plainActions.length > 1) {
      return {
        type: actionTypes.BATCH,
        model,
        actions: plainActions,
      };
    } else if (plainActions.length === 1) {
      return plainActions[0];
    }
  }

  return (dispatch) => {
    if (plainActions.length > 1) {
      dispatch({
        type: actionTypes.BATCH,
        model,
        actions: plainActions,
      });
    } else if (plainActions.length === 1) {
      dispatch(plainActions[0]);
    }
    actionThunks.forEach(dispatch);
  };
});

function dispatchBatchIfNeeded(model, actions, dispatch) {
  if (!actions.length) return void 0;

  const dispatchableActions = actions.filter((action) => !!action);

  if (!dispatchableActions.length) return void 0;

  return dispatch(batch(model, dispatchableActions));
}

export default batch;
export {
  dispatchBatchIfNeeded,
};
