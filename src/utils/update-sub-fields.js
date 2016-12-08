import get from './get';
import i from 'icepick';

function updateSubField(subField, newSubState) {
  // Form
  if (subField && subField.$form) {
    // intermediate value - not mutated outside function
    const result = {};

    Object.keys(subField).forEach((key) => {
      if (key === '$form') {
        result.$form = i.assign(subField.$form, newSubState);
      } else {
        result[key] = updateSubField(subField[key], newSubState);
      }
    });

    return result;
  }

  // Field
  return i.assign(subField, newSubState);
}

export default function updateSubFields(state, localPath, newState) {
  const field = get(state, localPath);

  // only forms can have fields -
  // skip if field is not a form
  if (!field || !field.$form) return state;

  // intermediate value - not mutated outside function
  const updatedField = {};

  Object.keys(field).forEach((key) => {
    if (key === '$form') {
      updatedField.$form = field.$form;
    } else {
      updatedField[key] = updateSubField(field[key], newState);
    }
  });

  if (!localPath.length) return updatedField;

  return i.assocIn(state, localPath, updatedField);
}
