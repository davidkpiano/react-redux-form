import findKey from 'lodash/findKey';
import get from 'lodash/get';

function track(model, predicate) {
  return (state) => {
    const [
      parentModelPath,
      childModelPath = '',
    ] = model.split(/\[\]\.?/);
    const parentValue = get(state, parentModelPath);

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
