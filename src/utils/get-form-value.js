import mapValues from './map-values';
import toArray from './to-array';

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

  const isArray = form && form.$form && Array.isArray(form.$form.value);

  return isArray ? toArray(result) : result;
}
