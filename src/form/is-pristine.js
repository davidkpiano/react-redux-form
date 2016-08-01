export default function isPristine(formState) {
  if (!formState) return false;

  // Field is pending
  if (!formState.$form) {
    return formState.pristine;
  }

  // Every field in form is pristine
  return Object.keys(formState).every((key) => isPristine(formState[key]));
}
