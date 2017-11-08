import mapValues from './map-values';

export default function getFormValue(form) {
  if (form && !form.$form) {
    return typeof form.loadedValue !== 'undefined'
      ? form.loadedValue
      : form.initialValue;
  }

  const result = mapValues(form, (field, key) => {
    if (key === '$form') return undefined;

    return getFormValue(field);
  });

  delete result.$form;

  const isArray = Array.isArray(form.$form.value);

  return isArray ? Object.values(result) : result;
}
