import findKey from 'lodash/findKey';
import _get from '../utils/get';

function track(model, predicate) {
  return (state) => {
    const [
      parentModelPath,
      childModelPath = '',
    ] = model.split(/\[\]\.?/);
    const parentValue = _get(state, parentModelPath);

    return [
      parentModelPath,
      findKey(parentValue, predicate),
      childModelPath,
    ].filter((path) => !!path).join('.');
  };
}

function trackable(actionCreator) {
  return (model, ...args) => {
    if (typeof model === 'function') {
      return (dispatch, getState) => {
        const modelPath = model(getState());

        dispatch(actionCreator(modelPath, ...args));
      };
    }

    return actionCreator(model, ...args);
  };
}

export {
  track,
  trackable,
};
