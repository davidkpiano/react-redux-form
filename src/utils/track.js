import findKey from 'lodash/findKey';
import _get from '../utils/get';

function track(model, ...predicates) {
  return (state) => {
    const [
      parentModelPath,
      ...childModelPaths
    ] = model.split(/\[\]\.?/);

    let fullPath = parentModelPath;
    let subState = _get(state, fullPath);

    predicates.forEach((predicate, i) => {
      const childModelPath = childModelPaths[i];
      const subPath = childModelPath
        ? `${findKey(subState, predicate)}.${childModelPath}`
        : `${findKey(subState, predicate)}`;

      subState = _get(subState, subPath);
      fullPath += `.${subPath}`;
    });

    return fullPath;
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
