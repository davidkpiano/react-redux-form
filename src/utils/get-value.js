function isEvent(event) {
  return !!(event && event.stopPropagation && event.preventDefault);
}

function getEventValue(event) {
  const { target } = event;

  if (!target) {
    if (!event.nativeEvent) {
      return undefined;
    }

    return event.nativeEvent.text;
  }

  if (target.type === 'file') {
    return [...target.files]
      || (target.dataTransfer && [...target.dataTransfer.files]);
  }

  if (target.multiple) {
    return [...target.selectedOptions].map((option) => option.value);
  }

  return target.value;
}

export default function getValue(value) {
  return isEvent(value) ? getEventValue(value) : value;
}
