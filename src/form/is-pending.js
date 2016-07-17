export default function isPending(formState) {
  if (!formState) return false;

  // TODO: deprecate
  if (formState.hasOwnProperty('pending')) return formState.pending;

  // Field is pending
  if (!formState.$form) {
    return formState.pending;
  }

  // Any field in form is pending
  return Object.keys(formState).some((key) => isPending(formState[key]));
}
