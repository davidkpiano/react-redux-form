
let currentFocusedModel = '';

function handleFocus(fieldValue, node) {
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

handleFocus.clearCache = () => currentFocusedModel = ''; // eslint-disable-line no-return-assign

export default handleFocus;
