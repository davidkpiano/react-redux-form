import _findKey from '../utils/find-key';
import _get from '../utils/get';
import { createIteratee } from '../utils/iteratee';
import isMulti from '../utils/is-multi';

const defaultStrategy = {
  findKey: _findKey,
  get: _get,
};

function createTrack(s = defaultStrategy) {
  const iteratee = createIteratee(s);

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
          ? `${s.findKey(subState, predicateIteratee)}.${childModelPath}`
          : `${s.findKey(subState, predicateIteratee)}`;

        subState = s.get(subState, subPath);
        fullPath += `.${subPath}`;
      });

      if (isMulti(childModel) && predicates.length < childModelPaths.length) {
        fullPath += '[]';
      }

      return isPartial
        ? `${parentModel}.${fullPath}`
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
