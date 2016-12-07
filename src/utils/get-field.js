import isPlainObject from 'lodash/isPlainObject';
import get from './get';
import initialFieldState from '../constants/initial-field-state';
import Immutable from 'immutable';

const defaultStrategies = {
	get,
};

export function createGetField(s = defaultStrategies) {
	return function getField(state, path) {
	  if (process.env.NODE_ENV !== 'production') {
	    if (!isPlainObject(state) && !Immutable.Iterable.isIterable(state)) {
	      throw new Error(`Could not retrieve field '${path}' `
	        + 'from an invalid/empty form state.');
	    }
	  }

	  const result = s.get(state, path, initialFieldState);
	  const $form = s.get(result, '$form');

	  return $form ? $form : result;
	}
}

const getField = createGetField();
export default getField;