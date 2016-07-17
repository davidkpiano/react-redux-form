export default function isTouched(formState) {
  if (!formState) return false;

  // TODO: deprecate
  if (formState.hasOwnProperty('touched')) return formState.touched;

  // Field is touched
  if (!formState.$form) {
    return formState.touched;
  }

  // Any field in form is touched
  return Object.keys(formState).some((key) => isTouched(formState[key]));
}
