import actionTypes from '../action-types';
import partition from 'lodash/partition';
import every from 'lodash/every';

function batch(model, actions) {
  if (every(actions, (action) => typeof action !== 'function')) {
    return {
      type: actionTypes.BATCH,
      model,
      actions,
    };
  }

  return (dispatch) => {
    const [plainActions, actionThunks] = partition(actions,
      (action) => typeof action !== 'function');

    dispatch({
      type: actionTypes.BATCH,
      model,
      actions: plainActions,
    });

    actionThunks.map(dispatch);
  };
}

export default {
  batch,
};
