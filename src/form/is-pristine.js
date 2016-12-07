import get from '../utils/get';

const defaultStrategies = {
  get,
  keys: Object.keys
};

export function create(s = defaultStrategies) {
  return function isPristine(formState) {
    if (!formState) return false;

    // Form is pristine
    if (!s.get(formState, '$form')) {
      return s.get(formState, 'pristine');
    }

    // Every field in form is pristine
    return s.keys(formState).every((key) => {
      if (key === '$form') return true;

      return isPristine(s.get(formState, key));
    });
  }
}

const isPristine = create();
export default isPristine;