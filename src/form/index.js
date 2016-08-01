import isValid from './is-valid';
import isPending from './is-pending';
import isTouched from './is-Touched';
import isRetouched from './is-retouched';

export default function formSelector(formState) {
  return {
    ...formState,
    get valid() {
      return isValid(formState);
    },
    get pending() {
      return isPending(formState);
    },
    get touched() {
      return isTouched(formState);
    },
    get retouched() {
      return isRetouched(formState);
    },
  };
}

export {
  isValid,
  isPending,
  isTouched,
  isRetouched,
};
