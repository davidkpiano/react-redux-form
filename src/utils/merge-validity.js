import { isObjectLike } from './is-plain-object';
import { merge } from 'icepick';

export default function mergeValidity(fieldValidity, actionValidity) {
  if (!isObjectLike(fieldValidity) || !isObjectLike(actionValidity)) {
    // can't merge string/boolean validity with keyed validity
    return actionValidity;
  }

  return merge(fieldValidity, actionValidity);
}
