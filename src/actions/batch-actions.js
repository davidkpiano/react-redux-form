import actionTypes from '../action-types';
import partition from 'lodash/partition';
import isPlainObject from 'lodash/isPlainObject';

const nullAction = {
  type: actionTypes.NULL,
};

function batch(model, actions) {
  const dispatchableActions = actions.filter((action) => !!action);

  if (!dispatchableActions.length) return nullAction;

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

  return (dispatch) => {
    const [plainActions, actionThunks] = partition(dispatchableActions,
      (action) => typeof action !== 'function');

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
}

export default {
  batch,
};
