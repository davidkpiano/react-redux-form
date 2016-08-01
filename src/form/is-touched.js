export default function isTouched(formState) {
  if (!formState) return false;

  // Field is touched
  if (!formState.$form) {
    return formState.touched;
  }

  // Any field in form is touched
  return Object.keys(formState).some((key) => isTouched(formState[key]));
}
