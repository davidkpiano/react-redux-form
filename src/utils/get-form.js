import get from 'lodash/get';
import pathStartsWith from '../utils/path-starts-with';
import { getForm as _oldGetForm } from '../utils/index';

export default function getForm(state, modelString) {
  const form = Object.keys(state)
    .map((key) => state[key])
    .filter((sub) => {
      if (sub.$form
        && pathStartsWith(modelString, sub.$form.model)) {
        return true;
      }

      return false;
    })[0];

  if (!form) return _oldGetForm(state, modelString);

  return form;
}
