import isPlainObject from './is-plain-object';
import merge from './merge';

export default function mergeValidity(fieldValidity, actionValidity) {
  if (!isPlainObject(fieldValidity) || !isPlainObject(actionValidity)) {
    // can't merge string/boolean validity with keyed validity
    return actionValidity;
  }

  return merge({ ...fieldValidity }, actionValidity);
}
