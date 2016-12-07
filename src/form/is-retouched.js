import get from '../utils/get';

const defaultStrategies = {
  get,
  keys: Object.keys
};

export function create(s = defaultStrategies) {
	return function isRetouched(formState) {
	  if (!formState) return false;

	  // Field is pending
	  if (!s.get(formState, '$form')) {
	    return s.get(formState, 'retouched');
	  }

	  // Any field in form is pending
	  return s.keys(formState).some((key) => isRetouched(s.get(formState, key)));
	}
}

const isRetouched = create();
export default isRetouched;