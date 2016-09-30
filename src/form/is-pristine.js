export default function isPristine(formState) {
  if (!formState) return false;

  // Form is pristine
  if (!formState.$form) {
    return formState.pristine;
  }

  // Every field in form is pristine
  return Object.keys(formState).every((key) => {
    if (key === '$form') return true;

    return isPristine(formState[key]);
  });
}
