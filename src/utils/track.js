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

export {
  track,
};
