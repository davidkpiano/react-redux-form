import findKey from '../utils/find-key';
import _get from '../utils/get';
import iteratee from '../utils/iteratee';

const defaultStrategy = {
  get: _get,
};

function createTrack(s = defaultStrategy) {
  return function track(model, ...predicates) {
    const isPartial = model[0] === '.';

    return (fullState, parentModel) => {
      const childModel = isPartial
        ? model.slice(1)
        : model;
      const state = isPartial
        ? s.get(fullState, parentModel)
        : fullState;

      const [
        parentModelPath,
        ...childModelPaths
      ] = childModel.split(/\[\]\.?/);

      let fullPath = parentModelPath;
      let subState = s.get(state, fullPath);

      predicates.forEach((predicate, i) => {
        const childModelPath = childModelPaths[i];
        const predicateIteratee = iteratee(predicate);

        const subPath = childModelPath
          ? `${findKey(subState, predicateIteratee)}.${childModelPath}`
          : `${findKey(subState, predicateIteratee)}`;

        subState = s.get(subState, subPath);
        fullPath += `.${subPath}`;
      });

      return isPartial
        ? [parentModel, fullPath].join('.')
        : fullPath;
    };
  };
}

const track = createTrack();

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

export default track;
export {
  createTrack,
  trackable,
};
