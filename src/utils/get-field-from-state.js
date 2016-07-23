import get from './get';
import toPath from './to-path';
import { getFieldFromState as _oldGetFieldFromState } from './index';
import pathStartsWith from '../utils/path-starts-with';

export default function getFieldFromState(state, modelString) {
  const form = Object.keys(state)
    .map((key) => state[key])
    .filter((sub) => {
      if (sub.$form
        && pathStartsWith(modelString, sub.$form.model)) {
        return true;
      }

      return false;
    })[0];

  // TODO: deprecate
  if (!form) {
    return _oldGetFieldFromState(state, modelString);
  }

  if (!modelString.length) return form;

  const formPath = toPath(form.$form.model);
  const fieldPath = toPath(modelString).slice(formPath.length);

  const field = get(form, fieldPath);

  if (field && '$form' in field) return field.$form;

  return field;
}
