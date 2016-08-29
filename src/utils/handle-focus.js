
let currentFocusedModel = '';

export default function handleFocus(fieldValue, node) {
  if (fieldValue.focus && (currentFocusedModel !== fieldValue.model)) {
    if (document
      && document.activeElement !== node
      && node.focus
    ) {
      currentFocusedModel = fieldValue.model;
      node.focus();
    }
  } else if (document
    && document.activeElement === node
    && node.blur
  ) {
    node.blur();
  }
}
