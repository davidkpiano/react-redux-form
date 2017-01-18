import get from './get';
import i from 'icepick';
import identity from 'lodash.identity';

const defaultStrategies = {
  get,
  fromJS: identity,
  merge: i.assign,
  mergeDeep: i.merge,
  keys: Object.keys,
  setIn: i.assocIn,
  set: i.assoc,
};

function updateSubField(subField, newSubState, s = defaultStrategies) {
  // Form
  if (subField && s.get(subField, '$form')) {
    // intermediate value - not mutated outside function
    let result = s.fromJS({});

    s.keys(subField).forEach((key) => {
      if (key === '$form') {
        result = s.set(result, '$form', s.merge(s.get(subField, '$form'), newSubState));
      } else {
        result = s.set(result, key, updateSubField(s.get(subField, key), newSubState));
      }
    });

    return result;
  }

  // Field
  return s.merge(subField, newSubState);
}

export default function updateSubFields(state, localPath, newState, s = defaultStrategies) {
  const field = s.get(state, localPath);

  // only forms can have fields -
  // skip if field is not a form
  if (!field || !s.get(field, '$form')) return state;

  // intermediate value - not mutated outside function
  let updatedField = s.fromJS({});

  s.keys(field).forEach((key) => {
    if (key === '$form') {
      updatedField = s.set(updatedField, '$form', s.get(field, '$form'));
    } else {
      updatedField = s.set(updatedField, key, updateSubField(s.get(field, key), newState, s));
    }
  });

  if (!localPath.length) return s.fromJS(updatedField);

  return s.setIn(state, localPath, updatedField);
}
