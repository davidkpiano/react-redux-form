export default function isRetouched(formState) {
  if (!formState) return false;

  // Field is pending
  if (!formState.$form) {
    return formState.retouched;
  }

  // Any field in form is pending
  return Object.keys(formState).some((key) => isRetouched(formState[key]));
}
